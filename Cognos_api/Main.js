define([
  "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js?",
  "https://yassinrian.netlify.app/Cognos_api/CashflowView.js",
  "https://yassinrian.netlify.app/Cognos_api/DuckDbManager.js",
  "https://yassinrian.netlify.app/Cognos_api/CashflowTable.js",
], function (echarts, CashflowView, DuckDbManager, CashflowTable) {
  "use strict";

  class CashflowController {
    constructor() {
      this.chart = null;
      this.view = null;
      this.engine = new DuckDbManager();
      this.pendingData = null;
      this.chart = null;
      this.tableComponent = new CashflowTable("rtm-table-container");
    }

    // Inside your Main.js draw method
    draw(oControlHost) {
      this.view = new CashflowView(oControlHost);
      this.view.renderLayout();

      // Use your View's helper to get the exact DOM node
      const chartDom = this.view.getChartNode();
      if (chartDom) {
        this.chart = echarts.init(chartDom);
      }

      if (this.pendingData) {
        this.setData(oControlHost, this.pendingData);
      }
    }

    async setData(oControlHost, oData) {
      if (oData.name === "store_cashflow") {
        // 1. Race condition safety
        if (!this.view) {
          this.pendingData = oData;
          return;
        }

        const iRowCount = oData.rowCount;
        if (iRowCount === 0) {
          this.view.updateStatus("Wachten op data...");
          return;
        }

        // 2. Clean Extraction (Cognos DataStore -> Array)
        const colNames = oData.columnNames;
        const colCount = oData.columnCount;
        const allRows = [];

        for (let i = 0; i < iRowCount; i++) {
          const row = [];
          for (let j = 0; j < colCount; j++) {
            row.push(oData.getCellValue(i, j));
          }
          allRows.push(row);
        }

        this.pendingData = null;

        // 3. DuckDB Activation
        try {
          this.view.updateStatus("Engine starten...");
          await this.engine.init();

          this.view.updateStatus("Data inladen...");
          await this.engine.insertData("cashflow", colNames, allRows);

          this.view.updateStatus("Systeem Gereed: " + iRowCount + " rijen.");

          await this.updateAnalysis();
        } catch (error) {
          this.view.updateStatus("Fout: " + error.message);
        }
      }
    }

    async updateAnalysis() {
      // 1. Let's group the budget by Year
      const sql = `
            SELECT 
                CAST("Jaar" AS VARCHAR) as label, 
                SUM(CAST("Restbudget (okr)" AS DOUBLE)) as total_budget,
                SUM(CAST("Lopend totaal" AS DOUBLE)) as running_total
            FROM cashflow 
            GROUP BY "Jaar" 
            ORDER BY "Jaar" ASC
    `;

      try {
        const results = await this.engine.query(sql);
        console.log("SQL Analysis Results:", results);

        // Pass to ECharts
        this.renderChart(results);

        // 2. Update the Table (Synchronized!)
        this.tableComponent.render(results);
      } catch (e) {
        console.error("SQL Error:", e);
      }
    }

    renderChart(data) {
      if (!data || !this.chart || data.length === 0) return;

      const option = {
        title: { text: "Cashflow Details", left: "center" },
        tooltip: { trigger: "axis" },
        dataZoom: [
          { type: "slider", start: 0, end: 50, id: "syncZoom" },
          { type: "inside" },
        ],
        xAxis: { type: "category", data: data.map((d) => d.label) },
        yAxis: [
          { type: "value", name: "Budget" },
          { type: "value", name: "Totaal", position: "right" },
        ],
        series: [
          {
            name: "Restbudget",
            type: "bar",
            data: data.map((d) => d.total_budget),
            itemStyle: { color: (p) => (p.value >= 0 ? "#004699" : "#d9534f") },
          },
          {
            name: "Lopend Totaal",
            type: "line",
            yAxisIndex: 1,
            data: data.map((d) => d.running_total),
            itemStyle: { color: "#ffcc00" },
          },
        ],
      };

      this.chart.setOption(option);

      // --- SAFE SYNC LOGIC ---
      this.chart.off("datazoom");

      this.chart.on("datazoom", (params) => {
        try {
          // 1. Get the current view window from the chart model
          const model = this.chart.getModel();
          const axis = model.getComponent("xAxis", 0).axis;
          const range = axis.scale.getExtent(); // Get min/max index of visible bars

          const startIndex = range[0];
          const endIndex = range[1];

          // 2. Slice the data based on actual visible indices
          const filteredData = data.slice(startIndex, endIndex + 1);

          // 3. Only render if the table component is actually ready
          if (this.table && typeof this.table.render === "function") {
            this.table.render(filteredData);
          }
        } catch (e) {
          console.warn("Sync failed, but keeping script alive:", e);
        }
      });

      // Initial table render to match the 0-50% start
      const initialSplit = Math.ceil(data.length * 0.5);
      if (this.table) this.table.render(data.slice(0, initialSplit));
    }

    // einde class
  }
  return CashflowController;
});

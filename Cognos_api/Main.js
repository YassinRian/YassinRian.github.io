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
      if (!data || data.length === 0) return;

      const labels = data.map((d) => d.label);
      const budget = data.map((d) => d.total_budget);
      const running = data.map((d) => d.running_total);

      const option = {
        title: { text: "Cashflow Details", left: "center" },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderWidth: 1,
          borderColor: "#ccc",
        },
        dataZoom: [
          { type: "slider", start: 0, end: 50 }, // Initial view is 50%
          { type: "inside" },
        ],
        legend: { data: ["Restbudget", "Lopend Totaal"], bottom: 40 },
        grid: { bottom: 80 },
        xAxis: {
          type: "category",
          data: labels,
          axisLabel: { rotate: 45 },
        },
        yAxis: [
          { type: "value", name: "Budget (€)" },
          { type: "value", name: "Cumulatief", position: "right" },
        ],
        series: [
          {
            name: "Restbudget",
            type: "bar",
            data: budget,
            itemStyle: {
              color: (p) => (p.value >= 0 ? "#004699" : "#d9534f"),
            },
          },
          {
            name: "Lopend Totaal",
            type: "line",
            yAxisIndex: 1,
            smooth: true,
            symbol: "none",
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(255, 204, 0, 0.5)" },
                { offset: 1, color: "rgba(255, 204, 0, 0)" },
              ]),
            },
            data: running,
          },
        ],
      };

      this.chart.setOption(option);

      // --- Sync Logic ---
      this.chart.off("datazoom");

      // Define the update function so we can call it immediately AND on event
      const syncTable = (startPercent, endPercent) => {
        const startIndex = Math.floor((startPercent / 100) * data.length);
        const endIndex = Math.ceil((endPercent / 100) * data.length);
        const filteredData = data.slice(startIndex, endIndex);
        this.table.render(filteredData);
      };

      this.chart.on("datazoom", (params) => {
        let s, e;
        if (params.batch) {
          s = params.batch[0].start;
          e = params.batch[0].end;
        } else {
          // Handle cases where start/end might be undefined if only one changed
          s =
            params.start !== undefined
              ? params.start
              : this.chart.getOption().dataZoom[0].start;
          e =
            params.end !== undefined
              ? params.end
              : this.chart.getOption().dataZoom[0].end;
        }
        syncTable(s, e);
      });

      // --- ADD THIS: Initial Sync ---
      // This ensures the table matches the 'start: 0, end: 50' on first load
      syncTable(0, 50);
    }

    // einde class
  }
  return CashflowController;
});

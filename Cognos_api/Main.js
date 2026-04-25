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
      this.syncTimer = null;
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
        tooltip: { trigger: "axis" },
        dataZoom: [{ type: "slider", start: 0, end: 50 }, { type: "inside" }],
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

      // --- REWIRED SYNC LOGIC ---
      this.chart.off("datazoom");

      this.chart.on("datazoom", () => {
        // Use a small delay to let the chart finish its animation
        clearTimeout(this.syncTimer);
        this.syncTimer = setTimeout(() => {
          try {
            // 1. Get the actual visible labels from the X-Axis
            const model = this.chart.getModel();
            const xAxis = model.getComponent("xAxis", 0).axis;
            const viewLabels = xAxis.getViewLabels();

            if (viewLabels && viewLabels.length > 0) {
              // 2. Get the list of strings currently visible (e.g., ["2022", "2023"])
              const visibleNames = viewLabels.map((item) => item.label);

              // 3. Filter our main data array to match these names
              const filteredData = data.filter((d) =>
                visibleNames.includes(d.label),
              );

              // 4. Update the table
              if (this.table) {
                this.table.render(filteredData);
              }
            }
          } catch (e) {
            console.warn("Sync failed: Chart busy or labels not ready.");
          }
        }, 100); // 100ms is the "sweet spot" for performance
      });

      // Initial table render to match the 0-50% start
      const initialLabels = data
        .slice(0, Math.floor(data.length * 0.5))
        .map((d) => d.label);
      this.table.render(data.filter((d) => initialLabels.includes(d.label)));
    }

    // einde class
  }
  return CashflowController;
});

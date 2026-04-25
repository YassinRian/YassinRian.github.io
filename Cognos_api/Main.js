define([
  "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js?",
  "https://yassinrian.netlify.app/Cognos_api/CashflowView.js",
  "https://yassinrian.netlify.app/Cognos_api/DuckDbManager.js",
], function (echarts, CashflowView, DuckDbManager) {
  "use strict";

  class CashflowController {
    constructor() {
      this.chart = null;
      this.view = null;
      this.engine = new DuckDbManager();
      this.pendingData = null;
      this.chart = null;
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

          // --- CHANGE THIS: Call the SQL analysis, not the raw render ---
          this.updateAnalysis();

          // Final step: Trigger the visual draw
          this.renderChart();
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
      } catch (e) {
        console.error("SQL Error:", e);
      }
    }

    renderChart(data) {
      const labels = data.map((d) => d.label);
      const budget = data.map((d) => d.total_budget);
      const running = data.map((d) => d.running_total);

      const option = {
        title: { text: "Cashflow Verloop", left: "left" },
        tooltip: { trigger: "axis" },
        legend: { data: ["Restbudget", "Lopend Totaal"], bottom: 0 },
        xAxis: { type: "category", data: labels },
        yAxis: [
          { type: "value", name: "Budget" },
          { type: "value", name: "Totaal", position: "right" },
        ],
        series: [
          {
            name: "Restbudget",
            type: "bar",
            data: budget,
            itemStyle: { color: "#005da3" }, // Rotterdam Blue
          },
          {
            name: "Lopend Totaal",
            type: "line",
            yAxisIndex: 1,
            data: running,
            itemStyle: { color: "#ffcc00" }, // Accent Gold
          },
        ],
      };

      this.chart.setOption(option);
    }
  }
  return CashflowController;
});

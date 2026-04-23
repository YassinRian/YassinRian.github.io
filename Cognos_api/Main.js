define([
  "jquery",
  "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js",
  "https://yassinrian.netlify.app/Cognos_api/DuckDbManager.js",
  "https://yassinrian.netlify.app/Cognos_api/CashflowView.js",
], function ($, echarts, DuckDbManager, CashflowView) {
  "use strict";

  class CashflowController {
    constructor() {
      this.engine = new DuckDbManager();
      this.view = null;
      this.chart = null;
    }

    draw(oControlHost) {
      console.log("Main: draw() started");
      // CORRECTED: Passing the full host object
      this.view = new CashflowView(oControlHost);
      this.view.renderLayout();
    }

    async setData(oControlHost, oData) {
      if (oData.name === "store_cashflow") {
        // SAFETY CHECK: If rows don't exist, stop here and log it
        if (!oData.rows || oData.rows.length === 0) {
          console.warn(
            "Main: No data rows received! Check Categories/Values slots.",
          );
          this.view.updateStatus("Wachten op data configuratie...");
          return;
        }

        // Initialize ECharts if it's the first data load
        if (!this.chart) {
          const node = this.view.getChartNode();
          if (node) {
            this.chart = echarts.init(node);
            window.addEventListener("resize", () => this.chart.resize());
          }
        }

        try {
          this.view.updateStatus("Initialiseren DuckDB...");
          await this.engine.init();

          this.view.updateStatus("Data inladen...");
          const data = await this.engine.insertData(
            "cashflow",
            oData.columnNames,
            oData.rows,
          );

          this.view.updateStatus("Klaar! " + data.length + " rijen verwerkt.");
          console.log("Main: Pipeline complete. System ready for SQL.");
        } catch (error) {
          this.view.updateStatus("Fout: " + error.message);
          console.error("Main Error:", error);
        }
      }
    }
  }
  return CashflowController;
});

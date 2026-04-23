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
      this.pendingData = null; // Our "Backpack"
    }

    draw(oControlHost) {
      console.log("Main: draw() started");
      this.view = new CashflowView(oControlHost);
      this.view.renderLayout();

      // Check if data arrived while we were building
      if (this.pendingData) {
        console.log("Main: Processing pending data from backpack...");
        this.setData(oControlHost, this.pendingData);
      }
    }

    async setData(oControlHost, oData) {
      if (oData.name === "store_cashflow") {
        // If view isn't ready, put data in the backpack and stop
        if (!this.view) {
          console.warn("Main: Data arrived early. Saving to pendingData.");
          this.pendingData = oData;
          return;
        }

        // If we have no rows, wait
        if (!oData.rows || oData.rows.length === 0) {
          this.view.updateStatus("Wachten op data slots...");
          return;
        }

        this.view.updateStatus(
          "Data ontvangen: " + oData.rows.length + " rijen.",
        );
        this.pendingData = null; // Clear the backpack

        try {
          // Initialize ECharts node
          if (!this.chart) {
            const node = this.view.getChartNode();
            if (node) {
              this.chart = echarts.init(node);
            }
          }

          await this.engine.init();
          await this.engine.insertData(
            "cashflow",
            oData.columnNames,
            oData.rows,
          );
          this.view.updateStatus("Systeem Gereed! Rijen: " + oData.rows.length);

          console.log("SUCCESS: Data is loaded in DuckDB and ready for SQL.");
        } catch (error) {
          console.error("setData Error:", error);
        }
      }
    }
  }

  return CashflowController;
});

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
        if (!this.view) {
          this.pendingData = oData;
          return;
        }

        // --- NEW EXTRACTION LOGIC ---
        // Get rows and column names safely
        const rows = oData.rows;
        const colNames = oData.columnNames || oData.columns.map((c) => c.name);

        if (!rows || rows.length === 0) {
          this.view.updateStatus("Wachten op data slots...");
          return;
        }

        console.log(
          "Main: Data confirmed. Rows:",
          rows.length,
          "Cols:",
          colNames,
        );
        this.view.updateStatus("Data ontvangen: " + rows.length + " rijen.");

        try {
          // Ensure ECharts is ready
          if (!this.chart) {
            const node = this.view.getChartNode();
            if (node) {
              this.chart = echarts.init(node);
            }
          }

          await this.engine.init();

          // Pass the extracted rows/cols to DuckDB
          await this.engine.insertData("cashflow", colNames, rows);

          this.view.updateStatus("Systeem Gereed! Rijen: " + rows.length);
          console.log("Main: DuckDB is loaded with 87 rows.");
        } catch (error) {
          console.error("setData Error:", error);
          this.view.updateStatus("Fout in verwerking.");
        }
      }
    }
  }

  return CashflowController;
});

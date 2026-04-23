define([
  "jquery",
  "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js",
  "https://yassinrian.netlify.app/Cognos_api/DuckDbManager.js",
  "https://yassinrian.netlify.app/Cognos_api/CashflowView.js",
], function ($, echarts, DuckDbManager, CashflowView) {
  "use strict";

  console.log("!!! THE SCRIPT HAS LOADED !!!"); // ADD THIS LINE

  class CashflowController {
    constructor() {
      //this.engine = new DuckDbManager();
      this.view = null;
      this.chart = null;
    }

    draw(oControlHost) {
      this.view = new CashflowView(oControlHost.container);
      this.view.renderLayout();
    }

/*     async setData(oControlHost, oData) {
      if (oData.name === "store_cashflow") {
        const node = this.view.getChartNode();
        if (node) {
          this.chart = echarts.init(node);
          window.addEventListener("resize", () => this.chart.resize());
        } else {
          console.error(
            "Main: Chart node not found. Check if renderLayout ran.",
          );
        }

        this.view.updateStatus("Data ontvangen. Engine start...");

        try {
          await this.engine.init();
          await this.engine.insertData(
            "cashflow",
            oData.columnNames,
            oData.rows,
          );
          this.view.updateStatus("Data geladen in DuckDB! (Check Console)");
          console.log("Main: Ready to run local SQL queries.");
        } catch (error) {
          this.view.updateStatus("Fout: " + error.message);
          console.log("Main Error:", error);
        }
      }
    } */
  


}
  return CashflowController;
});

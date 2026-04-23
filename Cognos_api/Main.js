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
    console.log("Main: setData triggered for store:", oData.name);

    if (oData.name === "store_cashflow") {
        // 1. Check if View is ready (avoids the 'null' error)
        if (!this.view) {
            console.warn("Main: setData called before draw(). Waiting...");
            return; 
        }

        // 2. Check if data actually exists
        if (!oData.rows || oData.rows.length === 0) {
            console.warn("Main: No data rows received! Check Categories/Values slots.");
            this.view.updateStatus("Wachten op data configuratie...");
            return;
        }

        // 3. If we get here, we have data! 
        this.view.updateStatus("Data ontvangen: " + oData.rows.length + " rijen.");
        
        try {
            // Init ECharts if not done
            if (!this.chart) {
                const node = this.view.getChartNode();
                if (node) {
                    this.chart = echarts.init(node);
                    window.addEventListener('resize', () => this.chart.resize());
                }
            }

            await this.engine.init();
            await this.engine.insertData("cashflow", oData.columnNames, oData.rows);
            this.view.updateStatus("DuckDB Ready! Rijen: " + oData.rows.length);
            
        } catch (error) {
            console.error("setData Error:", error);
            this.view.updateStatus("Fout: " + error.message);
        }
    }
}






  }
  return CashflowController;
});

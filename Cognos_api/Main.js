define([
    "jquery",
    "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js",
    "https://yassinrian.netlify.app/Cognos_api/DuckDbManager.js",
    "https://yassinrian.netlify.app/Cognos_api/CashflowView.js"
], function($, echarts, DuckDbManager, CashflowView){
    "use strict"

    class CashflowController {
        constructor() {
            this.engine = new DuckDbManager();
            this.view = null;
            this.chart = null;
        }

        draw(oControlHost) {
            this.view = new CashflowView(oControlHost.container);
            this.view.renderLayout();

            // Initialize Echarts on the element provided by the view
            this.chart = echarts.init(this.view.getChartNode());

            window.addEventListener('resize', () => this.chart.resize());
        }

        async setData(oControlHost, oData) {
            if (oData.name === "store_cashflow") {
                this.view.updateStatus("Data ontvangen. Engine start...");

                try {
                    await this.engine.init();
                    await this.engine.insertData("cashflow", oData.columnNames, oData.rows);
                    this.view.updateStatus("Data geladen in DuckDB! (Check Console)");
                    console.log("Main: Ready to run local SQL queries.");
                } catch (error) {
                    this.view.updateStatus("Fout: " + error.message);
                    console.log("Main Error:", error);
                }
            }
        }
    }
    return CashflowController;
});

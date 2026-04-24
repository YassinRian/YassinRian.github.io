define([
    "https://yassinrian.netlify.app/Cognos_api/CashflowView.js"
], function(CashflowView) {
    "use strict";

    class CashflowController {
        constructor() {
            this.view = null;
            this.pendingData = null;
        }

        draw(oControlHost) {
            this.view = new CashflowView(oControlHost);
            this.view.renderLayout();

            if (this.pendingData) {
                this.setData(oControlHost, this.pendingData);
            }
        }

        setData(oControlHost, oData) {
          console.log(oData.rows.length);
            if (oData.name === "store_cashflow") {
                if (!this.view) {
                    this.pendingData = oData;
                    return;
                }

                const rows = oData.rows || [];
                if (rows.length > 0) {
                    this.view.updateStatus("Data geladen: " + rows.length + " rijen.");
                    this.pendingData = null;
                    
                    // Logic for DuckDB/ECharts initialization goes here next
                } else {
                    this.view.updateStatus("Wachten op data...");
                }
            }
        }
    }
    return CashflowController;
});
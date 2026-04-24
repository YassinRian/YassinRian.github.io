define([
    "https://yassinrian.netlify.app/Cognos_api/CashflowView.js"
], function(CashflowView) {
    "use strict";

    class CashflowController {
        constructor() {
            this.view = null;
            console.log("Controller: Loaded");
        }

        draw(oControlHost) {
            console.log("Controller: draw()");
            this.view = new CashflowView(oControlHost);
            this.view.renderLayout();
        }

        setData(oControlHost, oData) {
            console.log("Controller: setData for", oData.name);
            
            // Minimalist row check
            const rowCount = (oData.rows) ? oData.rows.length : 0;
            console.log("Controller: Rows found ->", rowCount);

            if (this.view) {
                this.view.updateStatus(rowCount > 0 ? "Data OK: " + rowCount : "Check Slots!");
            } else {
                console.warn("Controller: setData ran before draw!");
            }
        }
    }
    return CashflowController;
});

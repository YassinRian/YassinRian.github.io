define([
    "https://yassinrian.netlify.app/Cognos_api/CashflowView.js",
    "https://yassinrian.netlify.app/Cognos_api/DuckDbManager.js"
], function(CashflowView, DuckDbManager) {
    "use strict";

    class CashflowController {
        constructor() {
            this.view = null;
            this.engine = new DuckDbManager();
            this.pendingData = null;
            this.chart = null;
        }

        draw(oControlHost) {
            this.view = new CashflowView(oControlHost);
            this.view.renderLayout();

            // Handover if data beat the UI to the finish line
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
                    
                    // Final step: Trigger the visual draw
                    this.renderChart();
                } catch (error) {
                    this.view.updateStatus("Fout: " + error.message);
                }
            }
        }

        async renderChart() {
            // This is where we will write the SQL to draw the Rotterdam bars
            console.log("DuckDB is ready for SQL queries.");
        }
    }

    return CashflowController;
});
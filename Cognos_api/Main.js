define(["https://yassinrian.netlify.app/Cognos_api/CashflowView.js"], function (
  CashflowView,
) {
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
      console.log("Incoming Store Name:", oData.name);
      if (oData.name === "store_cashflow") {
        if (!this.view) {
          this.pendingData = oData;
          return;
        }

        // Use the official 'rowCount' member from your documentation
        const iRowCount = oData.rowCount;

        if (iRowCount > 0) {
          this.view.updateStatus("Data geladen: " + iRowCount + " rijen.");
          this.pendingData = null;

          // To use this with DuckDB, we need to convert the DataStore into a flat Array
          const allRows = [];
          const colCount = oData.columnCount;

          for (let i = 0; i < iRowCount; i++) {
            const row = [];
            for (let j = 0; j < colCount; j++) {
              row.push(oData.getCellValue(i, j));
            }
            allRows.push(row);
          }

          // Now 'allRows' is a standard array ready for DuckDB
          // this.engine.insertData("cashflow", oData.columnNames, allRows);
        } else {
          this.view.updateStatus("Wachten op data...");
        }
      }
    }
  }
  return CashflowController;
});

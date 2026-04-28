define(["jquery", "./DuckDbManager.js", "./App.js"], function ($, DuckDbManager, App) {
  "use strict";

  class Main {
    constructor() {
      this.engine = new DuckDbManager();
      this.root = null;
      this.React = null;
      this.AppComponent = null;
      this._pendingData = null;
    }

    async draw(oControlHost) {
      const container = document.createElement("div");
      oControlHost.container.appendChild(container);

      try {
        //const appPath = window.location.origin + "/" + require.toUrl("./App.js");
        const deps = "deps=react@18.2.0,react-dom@18.2.0";

        // 1. Load ESM dependencies
        this.React = await import("https://esm.sh/react@18.2.0");
        const { createRoot } = await import("https://esm.sh/react-dom@18.2.0/client");
        
        // 2. Load MUI Core and DataGrid
        const Mui = await import(`https://esm.sh/@mui/material@5.15.0?${deps}`);
        const MuiX = await import(`https://esm.sh/@mui/x-data-grid@6.18.0?${deps}`);

        // 3. Load App module
        const module = await import(App);
        this.AppComponent = module.initApp;
        this.root = createRoot(container);

        this._update(this._pendingData, { ...Mui, ...MuiX });
      } catch (err) {
        console.error("Dependency Load Error:", err);
      }
    }

    setData(oControlHost, oData) {
      if (oData && oData.name === "store_cashflow") {
        const payload = {
          columnNames: oData.columnNames,
          rows: Array.from({ length: oData.rowCount }, (_, i) =>
            oData.columnNames.map((_, j) => oData.getCellValue(i, j))
          ),
          rowCount: oData.rowCount
        };

        if (this.root && this.AppComponent) {
          this._update(payload);
        } else {
          this._pendingData = payload;
        }
      }
    }

    _update(payload, MuiBundle) {
      // If we already loaded MUI, keep using it; otherwise use the new bundle
      this._cachedMui = MuiBundle || this._cachedMui;
      
      this.root.render(
        this.React.createElement(this.AppComponent, { 
          engine: this.engine,
          data: payload,
          Mui: this._cachedMui 
        })
      );
    }
  }

  return Main;
});

define(["jquery", "./DuckDbManager.js"], function ($, DuckDbManager) {
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
        const netlifyAppUrl = "https://yassinrian.netlify.app/react_cognos_api/App.js";

        // 1. FETCH code as text to bypass strict CORS module blocking
        const response = await fetch(netlifyAppUrl);
        const scriptText = await response.text();

        // 2. CREATE a local Blob URL
        const blob = new Blob([scriptText], { type: 'text/javascript' });
        const blobUrl = URL.createObjectURL(blob);

        // 3. LOAD dependencies via ESM
        this.React = await import("https://esm.sh/react@18.2.0");
        const { createRoot } = await import("https://esm.sh/react-dom@18.2.0/client");
        const deps = "deps=react@18.2.0,react-dom@18.2.0";
        const Mui = await import(`https://esm.sh/@mui/material@5.15.0?${deps}`);
        const MuiX = await import(`https://esm.sh/@mui/x-data-grid@6.18.0?${deps}`);

        // 4. IMPORT from the Blob URL
        const module = await import(blobUrl);
        
        // Cleanup the URL to save memory
        URL.revokeObjectURL(blobUrl);

        this.AppComponent = module.initApp;
        this.root = createRoot(container);
        this._update(this._pendingData, { ...Mui, ...MuiX });

    } catch (err) {
        console.error("Load Error:", err);
        oControlHost.container.innerHTML = "Error: " + err.message;
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

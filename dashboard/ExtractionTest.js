define(["./data/CognosAdapter"], function (CognosAdapter) {
  "use strict";

  /**
   * Simple extraction test module for Cognos.
   * Logs all data received from Cognos Data Module to console and displays on screen.
   */
  class ExtractionTest {
    constructor() {
      this.dataReceived = [];
    }

    /**
     * Cognos calls setData() for each data source.
     */
    setData(oControlHost, dataStore, name) {
      const datasetName = name || `dataset_${this.dataReceived.length + 1}`;
      console.log("========================================");
      console.log(`[ExtractionTest] setData called: "${datasetName}"`);
      console.log("========================================");
      console.log("[ExtractionTest] Raw dataStore:", dataStore);

      // Log structure
      const info = {
        name: datasetName,
        hasColumnHeaders: !!dataStore?.columnHeaders,
        hasRowData: !!dataStore?.rowData,
        columnCount: dataStore?.columnHeaders?.length || 0,
        rowCount: dataStore?.rowData?.length || 0,
      };
      console.log("[ExtractionTest] Structure:", info);

      // Log headers
      if (dataStore?.columnHeaders) {
        console.log("[ExtractionTest] Column Headers:");
        dataStore.columnHeaders.forEach((h, i) => {
          const name = typeof h === "string" ? h : h.name || h.label;
          const type = typeof h === "string" ? "string" : h.dataType || "unknown";
          console.log(`  ${i + 1}. ${name} (${type})`);
        });
      }

      // Log first 3 rows
      if (dataStore?.rowData) {
        console.log("[ExtractionTest] First 3 rows:");
        dataStore.rowData.slice(0, 3).forEach((row, i) => {
          console.log(`  Row ${i + 1}:`, row);
        });
      }

      // Try conversion
      try {
        const { headers, data } = CognosAdapter.convert(dataStore);
        console.log("[ExtractionTest] Converted successfully:");
        console.log("  Headers:", headers);
        console.log("  Sample data:", data.slice(0, 3));
        this.dataReceived.push({ name: datasetName, headers, data, raw: dataStore });
      } catch (err) {
        console.error("[ExtractionTest] Conversion error:", err);
        this.dataReceived.push({ name: datasetName, error: err.message, raw: dataStore });
      }
    }

    /**
     * Cognos calls draw() after all setData() calls.
     */
    draw(oControlHost) {
      console.log("========================================");
      console.log("[ExtractionTest] draw() called");
      console.log("========================================");
      console.log("[ExtractionTest] Total datasets received:", this.dataReceived.length);

      // Render results to container
      const container = oControlHost.container;
      container.innerHTML = `
        <div style="font-family: -apple-system, sans-serif; padding: 20px;">
          <h1 style="font-size: 20px; margin-bottom: 20px;">Cognos Data Extraction Test</h1>
          
          <div style="background: #f6ffed; padding: 16px; border-left: 4px solid #52c41a; border-radius: 4px; margin-bottom: 20px;">
            <strong>Success!</strong> Received ${this.dataReceived.length} dataset(s).
            Check browser console (F12) for detailed output.
          </div>
          
          ${this.dataReceived.map(ds => this.renderDataset(ds)).join('')}
        </div>
      `;
    }

    renderDataset(dataset) {
      if (dataset.error) {
        return `
          <div style="background: #fff2f0; padding: 16px; border-left: 4px solid #ff4d4f; border-radius: 4px; margin-bottom: 16px;">
            <strong>Error:</strong> ${dataset.error}
          </div>
        `;
      }

      const { name, headers, data, raw } = dataset;
      
      return `
        <div style="background: white; padding: 16px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 16px;">
          <h2 style="font-size: 16px; margin: 0 0 12px 0;">Dataset: ${name}</h2>
          
          <div style="margin-bottom: 12px;">
            <strong>Columns (${headers.length}):</strong> ${headers.join(', ')}
          </div>
          
          <div style="margin-bottom: 12px;">
            <strong>Rows:</strong> ${data.length}
          </div>
          
          <h3 style="font-size: 13px; color: #666; margin: 16px 0 8px 0;">First 5 Rows:</h3>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr>
                  ${headers.map(h => `<th style="padding: 8px; background: #fafafa; border-bottom: 2px solid #eee; text-align: left;">${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.slice(0, 5).map(row => `
                  <tr>
                    ${headers.map(h => `<td style="padding: 8px; border-bottom: 1px solid #eee;">${row[h] !== null && row[h] !== undefined ? row[h] : '<span style="color: #999;">null</span>'}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <details style="margin-top: 12px;">
            <summary style="cursor: pointer; color: #1890ff; font-size: 13px;">Show Raw Data (JSON)</summary>
            <pre style="background: #1e1e1e; color: #d4d4d4; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 11px; margin-top: 8px;">${JSON.stringify(raw, null, 2)}</pre>
          </details>
        </div>
      `;
    }
  }

  return ExtractionTest;
});

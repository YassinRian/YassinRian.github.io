define([], function () {
  "use strict";

  /**
   * Self-contained extraction test module for Cognos.
   * No external dependencies - all conversion logic is inline.
   */
  class ExtractionTest {
    constructor() {
      this.datasets = [];
    }

    /**
     * Cognos calls setData() for each data source.
     */
    setData(oControlHost, dataStore, name) {
      const datasetName = name || `dataset_${this.datasets.length + 1}`;

      // Log to console
      console.log("========================================");
      console.log("[ExtractionTest] setData called: " + datasetName);
      console.log("========================================");
      console.log("[ExtractionTest] Raw dataStore:", dataStore);

      // Extract headers
      var headers = [];
      if (dataStore && dataStore.columnHeaders) {
        for (var i = 0; i < dataStore.columnHeaders.length; i++) {
          var h = dataStore.columnHeaders[i];
          if (typeof h === "string") {
            headers.push(h);
          } else {
            headers.push(h.name || h.label || "col_" + i);
          }
        }
      }

      // Extract rows
      var rows = [];
      if (dataStore && dataStore.rowData) {
        rows = dataStore.rowData;
      }

      // Convert to objects
      var data = [];
      for (var r = 0; r < rows.length; r++) {
        var obj = {};
        for (var c = 0; c < headers.length; c++) {
          obj[headers[c]] = rows[r][c];
        }
        data.push(obj);
      }

      // Log results
      console.log("[ExtractionTest] Headers:", headers);
      console.log("[ExtractionTest] Row count:", rows.length);
      console.log("[ExtractionTest] First 3 rows:", data.slice(0, 3));

      // Store
      this.datasets.push({
        name: datasetName,
        headers: headers,
        data: data,
        raw: dataStore,
      });
    }

    /**
     * Cognos calls draw() after all setData() calls.
     */
    draw(oControlHost) {
      console.log("========================================");
      console.log("[ExtractionTest] draw() called");
      console.log("[ExtractionTest] Datasets received: " + this.datasets.length);
      console.log("========================================");

      var container = oControlHost.container;
      var html = '<div style="font-family: -apple-system, sans-serif; padding: 20px;">';
      html += '<h1 style="font-size: 20px; margin-bottom: 20px;">Cognos Data Extraction Test</h1>';

      // Success message
      html += '<div style="background: #f6ffed; padding: 16px; border-left: 4px solid #52c41a; border-radius: 4px; margin-bottom: 20px;">';
      html += "<strong>Success!</strong> Received " + this.datasets.length + " dataset(s). Check console (F12) for detailed output.";
      html += "</div>";

      // Render each dataset
      for (var d = 0; d < this.datasets.length; d++) {
        var ds = this.datasets[d];
        html += this.renderDataset(ds);
      }

      html += "</div>";
      container.innerHTML = html;
    }

    renderDataset(dataset) {
      var name = dataset.name;
      var headers = dataset.headers;
      var data = dataset.data;

      var html = '<div style="background: white; padding: 16px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 16px;">';
      html += '<h2 style="font-size: 16px; margin: 0 0 12px 0;">Dataset: ' + name + "</h2>";

      // Summary
      html += '<div style="margin-bottom: 12px;"><strong>Columns (" + headers.length + "):</strong> ' + headers.join(", ") + "</div>";
      html += '<div style="margin-bottom: 12px;"><strong>Rows:</strong> ' + data.length + "</div>";

      // Table header
      html += '<h3 style="font-size: 13px; color: #666; margin: 16px 0 8px 0;">First 10 Rows:</h3>';
      html += '<div style="overflow-x: auto;">';
      html += '<table style="width: 100%; border-collapse: collapse; font-size: 12px;">';
      html += "<thead><tr>";

      for (var h = 0; h < headers.length; h++) {
        html += '<th style="padding: 8px; background: #fafafa; border-bottom: 2px solid #eee; text-align: left; white-space: nowrap;">' + headers[h] + "</th>";
      }
      html += "</tr></thead>";

      // Table body (first 10 rows)
      html += "<tbody>";
      var maxRows = Math.min(data.length, 10);
      for (var r = 0; r < maxRows; r++) {
        html += "<tr>";
        for (var c = 0; c < headers.length; c++) {
          var val = data[r][headers[c]];
          var display = val !== null && val !== undefined ? val : '<span style="color: #999;">null</span>';
          html += '<td style="padding: 8px; border-bottom: 1px solid #eee;">' + display + "</td>";
        }
        html += "</tr>";
      }
      html += "</tbody></table></div>";

      // Raw JSON toggle
      html += '<details style="margin-top: 12px;">';
      html += '<summary style="cursor: pointer; color: #1890ff; font-size: 13px;">Show Raw JSON (first 3 rows)</summary>';
      html += '<pre style="background: #1e1e1e; color: #d4d4d4; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 11px; margin-top: 8px;">';
      html += JSON.stringify(data.slice(0, 3), null, 2);
      html += "</pre></details>";

      html += "</div>";
      return html;
    }
  }

  return ExtractionTest;
});

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
      var datasetName = name || "dataset_" + (this.datasets.length + 1);

      // Log to console
      console.log("========================================");
      console.log("[ExtractionTest] setData called: " + datasetName);
      console.log("========================================");
      console.log("[ExtractionTest] Raw dataStore:", dataStore);

      // Debug: Check all properties of dataStore
      console.log("[ExtractionTest] dataStore keys:", Object.keys(dataStore || {}));
      console.log("[ExtractionTest] dataStore.columnHeaders:", dataStore ? dataStore.columnHeaders : "N/A");
      console.log("[ExtractionTest] dataStore.rowData:", dataStore ? dataStore.rowData : "N/A");
      console.log("[ExtractionTest] dataStore.rowCount:", dataStore ? dataStore.rowCount : "N/A");
      console.log("[ExtractionTest] dataStore.data:", dataStore ? dataStore.data : "N/A");

      // Try different data structures Cognos might use
      var headers = [];
      var rows = [];

      if (dataStore) {
        // Extract headers - try multiple possible structures
        if (dataStore.columnHeaders) {
          for (var i = 0; i < dataStore.columnHeaders.length; i++) {
            var h = dataStore.columnHeaders[i];
            if (typeof h === "string") {
              headers.push(h);
            } else if (h && h.name) {
              headers.push(h.name);
            } else if (h && h.label) {
              headers.push(h.label);
            } else {
              headers.push("col_" + i);
            }
          }
        } else if (dataStore.columns) {
          // Alternative structure
          headers = dataStore.columns;
        }

        // Extract rows - try multiple possible structures
        if (dataStore.rowData && dataStore.rowData.length > 0) {
          rows = dataStore.rowData;
        } else if (dataStore.data && dataStore.data.length > 0) {
          rows = dataStore.data;
        } else if (dataStore.rows && dataStore.rows.length > 0) {
          rows = dataStore.rows;
        }

        // Debug: Check if data is nested
        if (rows.length === 0 && dataStore.rowData) {
          console.log("[ExtractionTest] rowData type:", typeof dataStore.rowData);
          console.log("[ExtractionTest] rowData isArray:", Array.isArray(dataStore.rowData));
          if (dataStore.rowData && typeof dataStore.rowData === "object") {
            console.log("[ExtractionTest] rowData keys:", Object.keys(dataStore.rowData));
          }
        }
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
      if (data.length > 0) {
        console.log("[ExtractionTest] First 3 rows:", data.slice(0, 3));
      }

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
      var raw = dataset.raw;

      var html = '<div style="background: white; padding: 16px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 16px;">';
      html += '<h2 style="font-size: 16px; margin: 0 0 12px 0;">Dataset: ' + name + "</h2>";

      // Summary
      html += '<div style="margin-bottom: 8px;"><strong>Columns:</strong> ' + headers.length + "</div>";
      html += '<div style="margin-bottom: 8px;"><strong>Column Names:</strong> ' + (headers.length > 0 ? headers.join(", ") : "none") + "</div>";
      html += '<div style="margin-bottom: 12px;"><strong>Rows:</strong> ' + data.length + '</div>';

      // Debug info
      html += '<div style="background: #fff7e6; padding: 12px; border-radius: 4px; margin-bottom: 16px; font-size: 12px;">';
      html += "<strong>Debug Info:</strong><br>";
      html += "Raw dataStore keys: " + (raw ? Object.keys(raw).join(", ") : "N/A") + "<br>";
      html += "Has columnHeaders: " + (raw && raw.columnHeaders ? "yes (" + raw.columnHeaders.length + ")" : "no") + "<br>";
      html += "Has rowData: " + (raw && raw.rowData ? "yes (" + (raw.rowData ? raw.rowData.length : 0) + ")" : "no") + "<br>";
      html += "Has data: " + (raw && raw.data ? "yes" : "no") + "<br>";
      html += "Has rows: " + (raw && raw.rows ? "yes" : "no");
      html += "</div>";

      // Table header
      if (headers.length > 0) {
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
            var display = val !== null && val !== undefined ? String(val) : '<span style="color: #999;">null</span>';
            html += '<td style="padding: 8px; border-bottom: 1px solid #eee;">' + display + "</td>";
          }
          html += "</tr>";
        }
        html += "</tbody></table></div>";
      } else {
        html += '<div style="background: #fff2f0; padding: 12px; border-radius: 4px; color: #cf1322;">No column headers detected</div>';
      }

      // Raw JSON toggle
      html += '<details style="margin-top: 12px;">';
      html += '<summary style="cursor: pointer; color: #1890ff; font-size: 13px;">Show Raw DataStore (JSON)</summary>';
      html += '<pre style="background: #1e1e1e; color: #d4d4d4; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 11px; margin-top: 8px; max-height: 400px; overflow-y: auto;">';
      html += JSON.stringify(raw, null, 2).substring(0, 5000);
      if (JSON.stringify(raw).length > 5000) {
        html += "\n... (truncated)";
      }
      html += "</pre></details>";

      html += "</div>";
      return html;
    }
  }

  return ExtractionTest;
});

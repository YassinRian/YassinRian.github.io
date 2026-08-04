// ExtractionTest.js - Simple Cognos data extraction test
// Log immediately to verify module loads
console.log("[ExtractionTest] Module file loaded");

define([], function () {
  "use strict";

  console.log("[ExtractionTest] define() callback executed");

  class ExtractionTest {
    constructor() {
      console.log("[ExtractionTest] constructor called");
      this.datasets = [];
      this.setDataCalled = false;
      this.drawCalled = false;
    }

    setData(oControlHost, dataStore, name) {
      console.log("[ExtractionTest] setData() called");
      this.setDataCalled = true;

      var datasetName = name || "dataset_" + (this.datasets.length + 1);
      console.log("[ExtractionTest] Dataset name:", datasetName);
      console.log("[ExtractionTest] dataStore:", dataStore);

      this.datasets.push({
        name: datasetName,
        raw: dataStore,
      });
    }

    draw(oControlHost) {
      console.log("[ExtractionTest] draw() called");
      this.drawCalled = true;

      var container = oControlHost.container;
      var html = "";

      html += '<div style="font-family: sans-serif; padding: 20px;">';
      html += '<h1 style="font-size: 18px; margin-bottom: 16px;">Cognos Extraction Test</h1>';

      // Status
      html += '<div style="background: #f6ffed; padding: 12px; border-left: 4px solid #52c41a; margin-bottom: 16px;">';
      html += "<strong>Status:</strong><br>";
      html += "setData called: " + (this.setDataCalled ? "YES" : "NO") + "<br>";
      html += "draw called: YES<br>";
      html += "Datasets received: " + this.datasets.length;
      html += "</div>";

      // Process each dataset
      for (var d = 0; d < this.datasets.length; d++) {
        var ds = this.datasets[d];
        html += this.renderDataset(ds);
      }

      html += "</div>";
      container.innerHTML = html;
    }

    renderDataset(dataset) {
      var html = "";
      var raw = dataset.raw;

      html += '<div style="background: white; padding: 16px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 16px;">';
      html += '<h2 style="font-size: 14px; margin: 0 0 12px 0;">Dataset: ' + dataset.name + "</h2>";

      if (!raw) {
        html += '<div style="color: #999;">No data received</div>';
        html += "</div>";
        return html;
      }

      // Show keys
      var keys = [];
      for (var k in raw) {
        if (raw.hasOwnProperty(k)) {
          keys.push(k);
        }
      }
      html += '<div style="margin-bottom: 8px;"><strong>Keys:</strong> ' + keys.join(", ") + "</div>";

      // Column headers
      if (raw.columnHeaders) {
        html += '<div style="margin-bottom: 8px;"><strong>Columns (' + raw.columnHeaders.length + "):</strong></div>";
        html += '<div style="margin-bottom: 12px; padding: 8px; background: #f5f5f5; font-size: 12px;">';
        for (var i = 0; i < raw.columnHeaders.length; i++) {
          var h = raw.columnHeaders[i];
          if (typeof h === "string") {
            html += (i + 1) + ". " + h + "<br>";
          } else if (h && h.name) {
            html += (i + 1) + ". " + h.name + "<br>";
          } else {
            html += (i + 1) + ". [object]<br>";
          }
        }
        html += "</div>";
      }

      // Row data
      if (raw.rowData) {
        html += '<div style="margin-bottom: 8px;"><strong>Rows: ' + raw.rowData.length + "</strong></div>";

        if (raw.rowData.length > 0 && raw.columnHeaders) {
          html += '<div style="overflow-x: auto;">';
          html += '<table style="border-collapse: collapse; font-size: 11px; width: 100%;">';

          // Header
          html += "<tr>";
          for (var c = 0; c < raw.columnHeaders.length; c++) {
            var colName = typeof raw.columnHeaders[c] === "string" ? raw.columnHeaders[c] : raw.columnHeaders[c].name;
            html += '<th style="border: 1px solid #ddd; padding: 6px; background: #fafafa; text-align: left;">' + colName + "</th>";
          }
          html += "</tr>";

          // First 5 rows
          var maxRows = Math.min(raw.rowData.length, 5);
          for (var r = 0; r < maxRows; r++) {
            html += "<tr>";
            var row = raw.rowData[r];
            for (var v = 0; v < row.length; v++) {
              var val = row[v] !== null && row[v] !== undefined ? row[v] : '<span style="color: #999;">null</span>';
              html += '<td style="border: 1px solid #ddd; padding: 6px;">' + val + "</td>";
            }
            html += "</tr>";
          }
          html += "</table></div>";
        }
      }

      // Raw JSON
      html += '<details style="margin-top: 12px;">';
      html += '<summary style="cursor: pointer; color: #1890ff;">Raw JSON</summary>';
      html += '<pre style="background: #1e1e1e; color: #d4d4d4; padding: 10px; font-size: 10px; overflow: auto; max-height: 300px;">';
      try {
        html += JSON.stringify(raw, null, 2).substring(0, 2000);
      } catch (e) {
        html += "Error: " + e.message;
      }
      html += "</pre></details>";

      html += "</div>";
      return html;
    }
  }

  console.log("[ExtractionTest] Returning class");
  return ExtractionTest;
});

console.log("=== ExtractionTest.js FILE LOADED ===");

define([], function () {
  console.log("=== ExtractionTest DEFINE CALLBACK ===");

  class ExtractionTest {
    constructor() {
      console.log("=== ExtractionTest CONSTRUCTOR ===");
      this.dataStore = null;
      this.oControlHost = null;
    }

    setData(oControlHost, dataStore, name) {
      console.log("=== setData() CALLED ===");
      this.dataStore = dataStore;
      this.oControlHost = oControlHost;

      // Log all properties
      console.log("--- dataStore properties ---");
      console.log("dataStore:", dataStore);

      // Check all possible data locations
      var checks = [
        "name", "columnCount", "rowCount", "columnNames", "dataTypes",
        "columnValues", "columnFormattedValues", "json", "index"
      ];
      for (var i = 0; i < checks.length; i++) {
        try {
          var val = dataStore[checks[i]];
          console.log("dataStore." + checks[i] + ":", val);
        } catch (e) {
          console.log("dataStore." + checks[i] + " ERROR:", e.message);
        }
      }

      // Check internal properties
      console.log("--- Internal properties ---");
      var keys = Object.keys(dataStore);
      console.log("dataStore keys:", keys);

      for (var k = 0; k < keys.length; k++) {
        try {
          var prop = dataStore[keys[k]];
          console.log("dataStore." + keys[k] + ":", prop);
        } catch (e) {
          console.log("dataStore." + keys[k] + " ERROR:", e.message);
        }
      }
    }

    draw(oControlHost) {
      console.log("=== draw() CALLED ===");

      var container = oControlHost.container;
      var ds = this.dataStore;

      if (!ds) {
        container.innerHTML = "<p>No data received</p>";
        return;
      }

      // Build output
      var html = '<div style="font-family: sans-serif; padding: 20px;">';
      html += '<h1 style="font-size: 18px;">Cognos Data Extraction</h1>';

      // Summary
      html += '<div style="background: #f6ffed; padding: 12px; margin: 12px 0; border-left: 4px solid #52c41a;">';
      html += "<strong>Dataset:</strong> " + ds.name + "<br>";
      html += "<strong>Columns:</strong> " + ds.columnCount + "<br>";
      html += "<strong>Rows:</strong> " + ds.rowCount + "<br>";
      html += "<strong>Keys:</strong> " + Object.keys(ds).join(", ");
      html += "</div>";

      // Column names
      var colNames = ds.columnNames;
      if (colNames) {
        html += '<div style="margin: 12px 0;"><strong>Column Names:</strong><br>';
        html += '<div style="background: #f5f5f5; padding: 8px; font-size: 12px;">';
        for (var i = 0; i < colNames.length; i++) {
          html += (i + 1) + ". " + colNames[i] + "<br>";
        }
        html += "</div></div>";
      }

      // Try to get data from different sources
      html += '<div style="background: #fff7e6; padding: 12px; margin: 12px 0; border-left: 4px solid #faad14;">';
      html += "<strong>Data Sources:</strong><br>";

      // Check columnValues
      var colValues = ds.columnValues;
      html += "columnValues: " + (colValues ? "exists (" + colValues.length + ")" : "null/undefined") + "<br>";

      // Check json
      try {
        var jsonData = ds.json;
        html += "json: " + (jsonData ? "exists" : "null/undefined") + "<br>";
        if (jsonData) {
          html += "json type: " + typeof jsonData + "<br>";
          if (typeof jsonData === "object") {
            html += "json keys: " + Object.keys(jsonData).join(", ") + "<br>";
          }
        }
      } catch (e) {
        html += "json ERROR: " + e.message + "<br>";
      }

      // Check formattedValues
      var formattedValues = ds.columnFormattedValues;
      html += "columnFormattedValues: " + (formattedValues ? "exists (" + formattedValues.length + ")" : "null/undefined") + "<br>";

      html += "</div>";

      // Try to display data from columnValues
      if (colValues && colValues.length > 0 && colValues[0] && colValues[0].length > 0) {
        html += '<h3 style="margin-top: 16px;">Data from columnValues:</h3>';
        html += this.renderTable(colNames, colValues, ds.rowCount);
      }
      // Try to display data from json
      else if (ds.json) {
        html += '<h3 style="margin-top: 16px;">Data from json:</h3>';
        html += this.renderJsonTable(ds.json);
      }
      else {
        html += '<div style="background: #fff2f0; padding: 12px; margin: 12px 0; border-left: 4px solid #ff4d4f;">';
        html += "No data found in any source";
        html += "</div>";
      }

      // Raw JSON
      html += '<details style="margin-top: 16px;">';
      html += '<summary style="cursor: pointer; color: #1890ff;">Show Raw JSON</summary>';
      html += '<pre style="background: #1e1e1e; color: #d4d4d4; padding: 10px; font-size: 10px; overflow: auto; max-height: 400px;">';
      try {
        html += JSON.stringify(ds.json, null, 2);
      } catch (e) {
        html += "Error: " + e.message;
      }
      html += "</pre></details>";

      html += "</div>";
      container.innerHTML = html;
    }

    renderTable(colNames, colValues, rowCount) {
      var html = '<div style="overflow-x: auto;">';
      html += '<table style="border-collapse: collapse; font-size: 12px; width: 100%;">';

      // Header
      html += "<tr>";
      for (var c = 0; c < colNames.length; c++) {
        html += '<th style="border: 1px solid #ddd; padding: 6px; background: #fafafa; white-space: nowrap;">' + colNames[c] + "</th>";
      }
      html += "</tr>";

      // Rows
      var maxRows = Math.min(rowCount, 10);
      for (var r = 0; r < maxRows; r++) {
        html += "<tr>";
        for (var v = 0; v < colValues.length; v++) {
          var val = colValues[v][r];
          html += '<td style="border: 1px solid #ddd; padding: 6px;">' + (val !== null && val !== undefined ? val : "null") + "</td>";
        }
        html += "</tr>";
      }
      html += "</table></div>";
      return html;
    }

    renderJsonTable(jsonData) {
      try {
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          var headers = Object.keys(jsonData[0]);
          var html = '<div style="overflow-x: auto;">';
          html += '<table style="border-collapse: collapse; font-size: 12px; width: 100%;">';

          // Header
          html += "<tr>";
          for (var h = 0; h < headers.length; h++) {
            html += '<th style="border: 1px solid #ddd; padding: 6px; background: #fafafa;">' + headers[h] + "</th>";
          }
          html += "</tr>";

          // Rows
          var maxRows = Math.min(jsonData.length, 10);
          for (var r = 0; r < maxRows; r++) {
            html += "<tr>";
            for (var v = 0; v < headers.length; v++) {
              var val = jsonData[r][headers[v]];
              html += '<td style="border: 1px solid #ddd; padding: 6px;">' + (val !== null && val !== undefined ? val : "null") + "</td>";
            }
            html += "</tr>";
          }
          html += "</table></div>";
          return html;
        }
      } catch (e) {
        return '<div style="color: red;">Error rendering JSON table: ' + e.message + "</div>";
      }
      return '<div style="color: #999;">No data in JSON</div>';
    }
  }

  return ExtractionTest;
});

console.log("=== ExtractionTest.js FILE LOADED ===");

define([], function () {
  console.log("=== ExtractionTest DEFINE CALLBACK ===");

  class ExtractionTest {
    constructor() {
      console.log("=== ExtractionTest CONSTRUCTOR ===");
      this.dataStore = null;
    }

    setData(oControlHost, dataStore, name) {
      console.log("=== setData() CALLED ===");
      console.log("dataStore:", dataStore);
      console.log("name:", name);

      this.dataStore = dataStore;

      // Use the Cognos public API (getter properties)
      console.log("--- Cognos dataStore API ---");
      console.log("dataStore.name:", dataStore.name);
      console.log("dataStore.columnCount:", dataStore.columnCount);
      console.log("dataStore.rowCount:", dataStore.rowCount);
      console.log("dataStore.columnNames:", dataStore.columnNames);
      console.log("dataStore.dataTypes:", dataStore.dataTypes);

      // Get actual data
      if (dataStore.columnValues) {
        console.log("dataStore.columnValues:", dataStore.columnValues);
      }

      // Try JSON
      try {
        var json = dataStore.json;
        console.log("dataStore.json:", json);
      } catch (e) {
        console.log("dataStore.json error:", e.message);
      }
    }

    draw(oControlHost) {
      console.log("=== draw() CALLED ===");
      console.log("oControlHost.container:", oControlHost.container);

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
      html += "<strong>Rows:</strong> " + ds.rowCount;
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

      // Data table using columnValues
      var colValues = ds.columnValues;
      if (colValues && colValues.length > 0 && ds.rowCount > 0) {
        html += '<h3 style="margin-top: 16px;">Data (first 10 rows):</h3>';
        html += '<div style="overflow-x: auto;">';
        html += '<table style="border-collapse: collapse; font-size: 12px; width: 100%;">';

        // Header
        html += "<tr>";
        for (var c = 0; c < colNames.length; c++) {
          html += '<th style="border: 1px solid #ddd; padding: 6px; background: #fafafa; white-space: nowrap;">' + colNames[c] + "</th>";
        }
        html += "</tr>";

        // Rows
        var maxRows = Math.min(ds.rowCount, 10);
        for (var r = 0; r < maxRows; r++) {
          html += "<tr>";
          for (var v = 0; v < colValues.length; v++) {
            var val = colValues[v][r];
            html += '<td style="border: 1px solid #ddd; padding: 6px;">' + (val !== null && val !== undefined ? val : "null") + "</td>";
          }
          html += "</tr>";
        }
        html += "</table></div>";
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
  }

  return ExtractionTest;
});

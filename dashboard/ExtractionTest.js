define([], function () {
  "use strict";

  // Ultra-simple extraction test - no dependencies, maximum compatibility
  function ExtractionTest() {
    this.data = null;
    this.drawCalled = false;
    this.setCalled = false;
  }

  // Cognos calls this first
  ExtractionTest.prototype.setData = function (oControlHost, dataStore, name) {
    try {
      this.setCalled = true;
      this.data = dataStore;
      this.dataName = name || "unnamed";

      // Try console log
      if (typeof console !== "undefined" && console.log) {
        console.log("[ExtractionTest] setData called");
        console.log("[ExtractionTest] name:", name);
        console.log("[ExtractionTest] dataStore:", dataStore);
      }
    } catch (e) {
      // Silent fail - draw will show error
    }
  };

  // Cognos calls this after setData
  ExtractionTest.prototype.draw = function (oControlHost) {
    try {
      this.drawCalled = true;
      var container = oControlHost.container;
      var output = "";

      output += '<div style="font-family: sans-serif; padding: 20px;">';
      output += '<h1 style="font-size: 18px;">Cognos Extraction Test</h1>';

      // Status
      output += '<div style="background: #f6ffed; padding: 12px; margin: 10px 0; border-left: 4px solid #52c41a;">';
      output += "draw() called: YES<br>";
      output += "setData() called: " + (this.setCalled ? "YES" : "NO") + "<br>";
      output += "Dataset name: " + (this.dataName || "N/A");
      output += "</div>";

      if (!this.data) {
        output += '<div style="background: #fff2f0; padding: 12px; margin: 10px 0; border-left: 4px solid #ff4d4f;">';
        output += "No data received from setData()";
        output += "</div>";
      } else {
        // Show data structure
        output += '<div style="background: #e6f7ff; padding: 12px; margin: 10px 0; border-left: 4px solid #1890ff;">';
        output += "<strong>Data received!</strong><br>";
        output += "Type: " + typeof this.data + "<br>";

        var keys = [];
        for (var k in this.data) {
          if (this.data.hasOwnProperty(k)) {
            keys.push(k);
          }
        }
        output += "Keys: " + keys.join(", ");
        output += "</div>";

        // Try to show columnHeaders
        if (this.data.columnHeaders) {
          output += '<div style="background: white; padding: 12px; margin: 10px 0; border: 1px solid #ddd;">';
          output += "<strong>Column Headers (" + this.data.columnHeaders.length + "):</strong><br>";
          for (var i = 0; i < this.data.columnHeaders.length; i++) {
            var h = this.data.columnHeaders[i];
            if (typeof h === "string") {
              output += (i + 1) + ". " + h + "<br>";
            } else if (h && h.name) {
              output += (i + 1) + ". " + h.name + " (" + (h.dataType || "unknown") + ")<br>";
            } else {
              output += (i + 1) + ". " + JSON.stringify(h) + "<br>";
            }
          }
          output += "</div>";
        }

        // Try to show rowData
        if (this.data.rowData) {
          output += '<div style="background: white; padding: 12px; margin: 10px 0; border: 1px solid #ddd;">';
          output += "<strong>Row Data: " + this.data.rowData.length + " rows</strong><br><br>";

          if (this.data.rowData.length > 0) {
            output += '<table style="border-collapse: collapse; font-size: 11px;">';

            // Header row
            if (this.data.columnHeaders) {
              output += "<tr>";
              for (var c = 0; c < this.data.columnHeaders.length; c++) {
                var colName = typeof this.data.columnHeaders[c] === "string"
                  ? this.data.columnHeaders[c]
                  : this.data.columnHeaders[c].name;
                output += '<th style="border: 1px solid #ddd; padding: 4px 8px; background: #fafafa;">' + colName + "</th>";
              }
              output += "</tr>";
            }

            // Data rows (first 5)
            var maxRows = Math.min(this.data.rowData.length, 5);
            for (var r = 0; r < maxRows; r++) {
              output += "<tr>";
              var row = this.data.rowData[r];
              for (var v = 0; v < row.length; v++) {
                output += '<td style="border: 1px solid #ddd; padding: 4px 8px;">' + (row[v] !== null ? row[v] : "null") + "</td>";
              }
              output += "</tr>";
            }
            output += "</table>";
          }
          output += "</div>";
        }

        // Raw JSON
        output += '<details style="margin-top: 10px;">';
        output += '<summary style="cursor: pointer;">Show Raw JSON</summary>';
        output += '<pre style="background: #1e1e1e; color: #d4d4d4; padding: 10px; font-size: 10px; overflow: auto; max-height: 300px;">';
        try {
          output += JSON.stringify(this.data, null, 2).substring(0, 3000);
        } catch (jsonErr) {
          output += "JSON.stringify error: " + jsonErr.message;
        }
        output += "</pre></details>";
      }

      output += "</div>";
      container.innerHTML = output;
    } catch (e) {
      // Last resort error display
      oControlHost.container.innerHTML =
        '<div style="padding: 20px; color: red;"><strong>Error in draw():</strong> ' + e.message + "<br>" + e.stack + "</div>";
    }
  };

  return ExtractionTest;
});

define([], function () {
  "use strict";

  /**
   * CognosDataConnector - Handles Cognos dataStore API and converts to row-oriented format.
   * 
   * Cognos dataStore structure:
   * - columnNames: string[] (array of column names)
   * - columnValues: Array[] (array of columns, each column is array of values)
   * - rowCount: number
   * - columnCount: number
   * - name: string (dataset name)
   */
  class CognosDataConnector {
    constructor() {
      this.datasets = {};
    }

    /**
     * Register a Cognos dataStore.
     * @param {string} name - Dataset name
     * @param {Object} dataStore - Cognos dataStore object
     */
    register(name, dataStore) {
      console.log("[CognosDataConnector] Registering dataset:", name);
      console.log("[CognosDataConnector] dataStore keys:", Object.keys(dataStore));

      // Check multiple possible data sources
      var columnNames = dataStore.columnNames || [];
      var columnValues = dataStore.columnValues || [];
      var columnFormattedValues = dataStore.columnFormattedValues || [];
      var rowCount = dataStore.rowCount || 0;

      console.log("[CognosDataConnector] columnValues length:", columnValues.length);
      console.log("[CognosDataConnector] columnFormattedValues length:", columnFormattedValues.length);

      // Check if columnValues has undefined entries
      var validColumns = 0;
      var undefinedColumns = [];
      for (var i = 0; i < columnValues.length; i++) {
        if (columnValues[i] === undefined || columnValues[i] === null) {
          undefinedColumns.push(columnNames[i] || "col_" + i);
        } else {
          validColumns++;
        }
      }
      console.log("[CognosDataConnector] Valid columns in columnValues:", validColumns);
      console.log("[CognosDataConnector] Undefined columns:", undefinedColumns);

      // Try to get data from columnFormattedValues if columnValues has gaps
      if (undefinedColumns.length > 0 && columnFormattedValues.length > 0) {
        console.log("[CognosDataConnector] Checking columnFormattedValues for missing data...");
        for (var i = 0; i < columnFormattedValues.length; i++) {
          var formattedCol = columnFormattedValues[i];
          if (formattedCol && columnValues[i] === undefined) {
            console.log("[CognosDataConnector] columnFormattedValues[" + i + "] (" + columnNames[i] + "):", {
              type: typeof formattedCol,
              length: formattedCol ? formattedCol.length : "N/A",
              sample: formattedCol ? formattedCol.slice(0, 3) : "N/A"
            });
          }
        }
      }

      // Check raw _dqn structure
      if (dataStore._dqn) {
        console.log("[CognosDataConnector] _dqn keys:", Object.keys(dataStore._dqn));
        if (dataStore._dqn.columns) {
          console.log("[CognosDataConnector] _dqn.columns length:", dataStore._dqn.columns.length);
          for (var i = 0; i < Math.min(dataStore._dqn.columns.length, 9); i++) {
            var col = dataStore._dqn.columns[i];
            console.log("[CognosDataConnector] _dqn.columns[" + i + "] (" + columnNames[i] + "):", {
              name: col ? col.name : "N/A",
              dataType: col ? col.dataType : "N/A",
              valuesType: col && col.values ? typeof col.values : "undefined",
              valuesLength: col && col.values && col.values.length !== undefined ? col.values.length : "N/A",
              sample: col && col.values && col.values.length > 0 ? col.values.slice(0, 3) : "empty"
            });
          }
        }
      }

      this.datasets[name] = {
        raw: dataStore,
        columnNames: columnNames,
        columnValues: columnValues,
        columnFormattedValues: columnFormattedValues,
        rowCount: rowCount,
        columnCount: dataStore.columnCount || 0,
        name: name,
      };

      console.log("[CognosDataConnector] Columns:", columnNames);
      console.log("[CognosDataConnector] Rows:", rowCount);
    }

    /**
     * Convert a Cognos dataStore to row-oriented format for DuckDB ingestion.
     * @param {string} name - Dataset name
     * @returns {Object[]} Array of row objects
     */
    toRows(name) {
      var ds = this.datasets[name];
      if (!ds) {
        console.error("[CognosDataConnector] Dataset not found:", name);
        return [];
      }

      var colNames = ds.columnNames;
      var colValues = ds.columnValues;
      var rowCount = ds.rowCount;

      if (!colNames || !colValues || rowCount === 0) {
        console.log("[CognosDataConnector] No data to convert");
        return [];
      }

      console.log("[CognosDataConnector] Converting " + rowCount + " rows...");

      // Clean column names for SQL compatibility
      var cleanNames = colNames.map(function (name) {
        return name
          .replace(/[^a-zA-Z0-9_]/g, "_")
          .replace(/^(\d)/, "_$1")
          .replace(/_+/g, "_")
          .replace(/^_|_$/g, "");
      });

      console.log("[CognosDataConnector] Original column names:", colNames);
      console.log("[CognosDataConnector] Clean column names:", cleanNames);
      console.log("[CognosDataConnector] columnValues length:", colValues ? colValues.length : "null");

      // Debug: Show detailed info for each column
      for (var c = 0; c < colNames.length; c++) {
        var col = colValues[c];
        var colType = col ? typeof col : "undefined";
        var colLength = col && col.length !== undefined ? col.length : "N/A";
        var sampleValues = [];
        
        if (col && Array.isArray(col) && col.length > 0) {
          // Get first 5 non-null values
          for (var s = 0; s < Math.min(col.length, 20); s++) {
            if (col[s] !== null && col[s] !== undefined) {
              sampleValues.push(col[s]);
              if (sampleValues.length >= 5) break;
            }
          }
        }
        
        console.log("[CognosDataConnector] Column [" + c + "] '" + colNames[c] + "' -> '" + cleanNames[c] + "':", {
          type: colType,
          length: colLength,
          sample: sampleValues,
          firstValue: col && col.length > 0 ? col[0] : "empty"
        });
      }

      // Convert column-oriented to row-oriented
      var rows = [];
      for (var r = 0; r < rowCount; r++) {
        var row = {};
        for (var c = 0; c < colNames.length; c++) {
          var val =
            colValues[c] && r < colValues[c].length ? colValues[c][r] : null;

          // Try to convert numeric strings to numbers
          if (val !== null && val !== undefined && typeof val === "string") {
            var num = Number(val);
            if (!isNaN(num) && val.trim() !== "") {
              val = num;
            }
          }

          row[cleanNames[c]] = val;
        }
        rows.push(row);
      }

      console.log("[CognosDataConnector] Converted " + rows.length + " rows");
      return rows;
    }

    /**
     * Get column names (cleaned for SQL).
     * @param {string} name - Dataset name
     * @returns {string[]} Clean column names
     */
    getCleanColumnNames(name) {
      var ds = this.datasets[name];
      if (!ds) return [];

      return ds.columnNames.map(function (name) {
        return name
          .replace(/[^a-zA-Z0-9_]/g, "_")
          .replace(/^(\d)/, "_$1")
          .replace(/_+/g, "_")
          .replace(/^_|_$/g, "");
      });
    }

    /**
     * Get dataset info.
     * @param {string} name - Dataset name
     * @returns {Object} Dataset info
     */
    getInfo(name) {
      return this.datasets[name] || null;
    }

    /**
     * Get all registered dataset names.
     * @returns {string[]} Dataset names
     */
    getNames() {
      return Object.keys(this.datasets);
    }

    /**
     * Check if a dataset exists.
     * @param {string} name - Dataset name
     * @returns {boolean}
     */
    has(name) {
      return !!this.datasets[name];
    }
  }

  return CognosDataConnector;
});

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

      this.datasets[name] = {
        raw: dataStore,
        columnNames: dataStore.columnNames || [],
        columnValues: dataStore.columnValues || [],
        rowCount: dataStore.rowCount || 0,
        columnCount: dataStore.columnCount || 0,
        name: name,
      };

      console.log("[CognosDataConnector] Columns:", this.datasets[name].columnNames);
      console.log("[CognosDataConnector] Rows:", this.datasets[name].rowCount);
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

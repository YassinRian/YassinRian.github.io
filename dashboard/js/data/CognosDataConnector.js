define([], function () {
  "use strict";

  /**
   * CognosDataConnector - Handles Cognos dataStore API.
   *
   * Cognos stores data differently for Categories vs Values:
   * - Categories (string/decimal): column descriptor has `values` array with distinct values
   * - Values (number): NO `values` array - actual data is in `_dqn.rows`
   *
   * We use `_dqn.rows` which contains ALL data for ALL columns.
   */
  class CognosDataConnector {
    constructor() {
      this.datasets = {};
    }

    /**
     * Register a Cognos dataStore.
     */
    register(name, dataStore) {
      console.log("[CognosDataConnector] Registering dataset:", name);

      // Get column names from _dqn.columns
      var columns = dataStore._dqn ? dataStore._dqn.columns : [];
      var columnNames = columns.map(function (col) {
        return col.name;
      });

      // Get rows from _dqn.rows
      var rows = dataStore._dqn ? dataStore._dqn.rows : [];

      console.log("[CognosDataConnector] Column names:", columnNames);
      console.log("[CognosDataConnector] Row count:", rows.length);

      this.datasets[name] = {
        raw: dataStore,
        columnNames: columnNames,
        columns: columns,
        rows: rows,
        name: name,
      };
    }

    /**
     * Convert Cognos rows to format suitable for DuckDB ingestion.
     * Cleans column names for SQL compatibility.
     */
    toRows(name) {
      var ds = this.datasets[name];
      if (!ds) {
        console.error("[CognosDataConnector] Dataset not found:", name);
        return [];
      }

      var columnNames = ds.columnNames;
      var rows = ds.rows;

      if (!rows || rows.length === 0) {
        console.log("[CognosDataConnector] No rows to convert");
        return [];
      }

      console.log("[CognosDataConnector] Converting " + rows.length + " rows...");

      // Clean column names for SQL compatibility
      var cleanNames = columnNames.map(function (name) {
        return name
          .replace(/[^a-zA-Z0-9_]/g, "_")
          .replace(/^(\d)/, "_$1")
          .replace(/_+/g, "_")
          .replace(/^_|_$/g, "");
      });

      console.log("[CognosDataConnector] Clean column names:", cleanNames);

      // Convert rows to use clean column names
      var result = [];
      for (var r = 0; r < rows.length; r++) {
        var row = rows[r];
        var cleanRow = {};
        for (var c = 0; c < columnNames.length; c++) {
          cleanRow[cleanNames[c]] = row[columnNames[c]];
        }
        result.push(cleanRow);
      }

      // Log sample of first row
      if (result.length > 0) {
        console.log("[CognosDataConnector] First row:", result[0]);
      }

      console.log("[CognosDataConnector] Converted " + result.length + " rows");
      return result;
    }

    /**
     * Get column names (cleaned for SQL).
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

    getNames() {
      return Object.keys(this.datasets);
    }

    has(name) {
      return !!this.datasets[name];
    }
  }

  return CognosDataConnector;
});

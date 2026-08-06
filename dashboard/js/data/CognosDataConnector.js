define([], function () {
  "use strict";

  /**
   * CognosDataConnector — Normalizes Cognos Data Module data for DuckDB.
   *
   * Cognos passes data via the standard Custom Control API:
   *   oData.columnNames       – string[]  (column headers)
   *   oData.columnCount       – number
   *   oData.rowCount          – number
   *   oData.getCellValue(r,c) – function  (returns cell value)
   *   oData.name              – string    (dataset identifier)
   *
   * We extract ALL rows eagerly at register() time so DuckDB
   * ingestion in draw() is synchronous with the data.
   */
  function CognosDataConnector() {
    this.datasets = {};
  }

  /**
   * Called by App.setData() for each dataset Cognos sends.
   * Extracts rows immediately using getCellValue() — the only
   * stable, documented Cognos API.
   */
  CognosDataConnector.prototype.register = function (name, oData) {
    console.log("[CognosDataConnector] Registering:", name || oData.name);

    var dsName = name || oData.name || "dataset";
    var colNames = oData.columnNames || [];
    var colCount = oData.columnCount || colNames.length;
    var rowCount = oData.rowCount || 0;

    console.log("[CognosDataConnector]", dsName,
      "— columns:", colCount, "rows:", rowCount);

    // Eagerly extract all rows using the stable getCellValue() API
    var rows = [];
    for (var r = 0; r < rowCount; r++) {
      var row = {};
      for (var c = 0; c < colCount; c++) {
        var rawName = colNames[c];
        var cleanName = cleanColumnName(rawName);
        row[cleanName] = oData.getCellValue(r, c);
      }
      rows.push(row);
    }

    // Build cleaned column-name list
    var cleanNames = colNames.map(function (n) {
      return cleanColumnName(n);
    });

    this.datasets[dsName] = {
      raw: oData,
      columnNames: cleanNames,
      rows: rows,
      name: dsName
    };

    console.log("[CognosDataConnector] Stored",
      rows.length, "rows for", dsName);

    if (rows.length > 0) {
      console.log("[CognosDataConnector] First row sample:", rows[0]);
    }
  };

  /**
   * Return rows as an array of clean-keyed objects for DuckDB CSV ingestion.
   */
  CognosDataConnector.prototype.toRows = function (name) {
    var ds = this.datasets[name];
    if (!ds) {
      console.error("[CognosDataConnector] Dataset not found:", name);
      return [];
    }
    return ds.rows;
  };

  /**
   * Return cleaned column names (SQL-safe).
   */
  CognosDataConnector.prototype.getCleanColumnNames = function (name) {
    var ds = this.datasets[name];
    return ds ? ds.columnNames : [];
  };

  CognosDataConnector.prototype.getNames = function () {
    return Object.keys(this.datasets);
  };

  CognosDataConnector.prototype.has = function (name) {
    return !!this.datasets[name];
  };

  /**
   * Convert a raw Cognos column name to a SQL-safe identifier.
   * "Project nummer"  →  "Project_nummer"
   * "Restbudget (okr)" → "Restbudget__okr_"
   */
  function cleanColumnName(raw) {
    if (!raw) return "_empty";
    return raw
      .replace(/[^a-zA-Z0-9_\u00C0-\u024F]/g, "_") // keep letters+digits+accented
      .replace(/^(\d)/, "_$1")                     // can't start with digit
      .replace(/_+/g, "_")                         // collapse runs
      .replace(/^_|_$/g, "");                      // trim
  }

  return CognosDataConnector;
});

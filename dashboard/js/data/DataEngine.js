define([], function () {
  "use strict";

  class DataEngine {
    constructor() {
      this.db = null;
      this.conn = null;
      this.tables = new Set();
    }

    async initialize() {
      const duckdb = await import(
        "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.29.0/+esm"
      );

      // Select bundles for browser (main thread + WASM)
      const DUCKDB_BUNDLES = duckdb.getJsDelivrBundles();
      const bundle = await duckdb.selectBundle(DUCKDB_BUNDLES);

      // Create a worker from the main JS bundle
      const workerUrl = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker}");`], {
          type: "text/javascript",
        }),
      );
      const worker = new Worker(workerUrl);
      const logger = new duckdb.ConsoleLogger();

      // Instantiate with explicit worker and WASM module
      this.db = new duckdb.AsyncDuckDB(logger, worker);
      await this.db.instantiate(bundle.mainModule);

      // Clean up the blob URL
      URL.revokeObjectURL(workerUrl);

      this.conn = await this.db.connect();
      console.log("[DataEngine] DuckDB-Wasm initialized");
      return this;
    }

    async ingest(tableName, data) {
      if (!data || data.length === 0) {
        console.warn("[DataEngine] No data to ingest");
        return;
      }

      // Convert JS objects to CSV string for ingestion
      const headers = Object.keys(data[0]);
      const csvRows = data.map((row) =>
        headers
          .map((h) => {
            const val = row[h];
            if (val === null || val === undefined) return "";
            const str = String(val);
            return str.includes(",") || str.includes('"')
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(","),
      );
      const csv = [headers.join(","), ...csvRows].join("\n");

      // Register CSV in DuckDB and create table
      await this.db.registerFileText(`${tableName}.csv`, csv);
      await this.conn.query(
        `CREATE OR REPLACE TABLE ${tableName} AS SELECT * FROM read_csv_auto('${tableName}.csv')`,
      );
      this.tables.add(tableName);

      console.log(
        `[DataEngine] Ingested ${data.length} rows into "${tableName}"`,
      );
    }

    async query(sql) {
      const result = await this.conn.query(sql);
      const rows = result.toArray();
      return rows.map((row) => this._convertRow(row));
    }

    /**
     * Convert a DuckDB row to a plain JS object, handling BigInt values.
     */
    _convertRow(row) {
      const obj = {};
      for (const [key, value] of Object.entries(row)) {
        obj[key] = this._convertValue(value);
      }
      return obj;
    }

    /**
     * Convert BigInt to Number, keep other types as-is.
     */
    _convertValue(value) {
      if (typeof value === "bigint") {
        // Convert BigInt to Number (safe for values up to 2^53)
        return Number(value);
      }
      if (value === null || value === undefined) {
        return null;
      }
      return value;
    }

    async selectAll(tableName, filters = {}) {
      let sql = `SELECT * FROM ${tableName}`;
      const whereClauses = this._buildWhereClauses(filters);

      if (whereClauses.length > 0) {
        sql += " WHERE " + whereClauses.join(" AND ");
      }

      return this.query(sql);
    }

    async aggregate(tableName, dimension, measure, aggFn, filters = {}) {
      let sql = `SELECT ${dimension}, ${aggFn}(${measure}) as value FROM ${tableName}`;
      const whereClauses = this._buildWhereClauses(filters);

      if (whereClauses.length > 0) {
        sql += " WHERE " + whereClauses.join(" AND ");
      }

      sql += ` GROUP BY ${dimension} ORDER BY value DESC`;
      return this.query(sql);
    }

    async getDistinct(tableName, column, filters = {}) {
      let sql = `SELECT DISTINCT ${column} FROM ${tableName}`;
      const whereClauses = this._buildWhereClauses(filters);

      if (whereClauses.length > 0) {
        sql += " WHERE " + whereClauses.join(" AND ");
      }

      sql += ` ORDER BY ${column}`;
      const result = await this.query(sql);
      return result.map((row) => row[column]);
    }

    async getTableInfo(tableName) {
      return this.query(`DESCRIBE ${tableName}`);
    }

    async getRowCount(tableName, filters = {}) {
      let sql = `SELECT COUNT(*) as count FROM ${tableName}`;
      const whereClauses = this._buildWhereClauses(filters);

      if (whereClauses.length > 0) {
        sql += " WHERE " + whereClauses.join(" AND ");
      }

      const result = await this.query(sql);
      return result[0].count;
    }

    _buildWhereClauses(filters) {
      const clauses = [];
      for (const [column, values] of Object.entries(filters)) {
        if (values && values.length > 0) {
          const escaped = values
            .map((v) => `'${String(v).replace(/'/g, "''")}'`)
            .join(",");
          clauses.push(`${column} IN (${escaped})`);
        }
      }
      return clauses;
    }

    /**
     * Ingest data directly from Cognos dataStore format.
     * @param {string} tableName - Name for the DuckDB table
     * @param {Object} cognosDataStore - Cognos dataStore with columnHeaders and rowData
     */
    async ingestFromCognos(tableName, cognosDataStore) {
      if (
        !cognosDataStore ||
        !cognosDataStore.rowData ||
        !cognosDataStore.columnHeaders
      ) {
        throw new Error("[DataEngine] Invalid Cognos dataStore format");
      }

      const headers = cognosDataStore.columnHeaders.map((h) =>
        typeof h === "string" ? h : h.name || h.label,
      );
      const rows = cognosDataStore.rowData;

      // Convert to CSV for DuckDB ingestion
      const csvRows = rows.map((row) =>
        row
          .map((val) => {
            if (val === null || val === undefined) return "";
            const str = String(val);
            return str.includes(",") || str.includes('"')
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(","),
      );
      const csv = [headers.join(","), ...csvRows].join("\n");

      await this.db.registerFileText(`${tableName}.csv`, csv);
      await this.conn.query(
        `CREATE OR REPLACE TABLE ${tableName} AS SELECT * FROM read_csv_auto('${tableName}.csv')`,
      );
      this.tables.add(tableName);

      console.log(
        `[DataEngine] Ingested Cognos dataset "${tableName}" (${rows.length} rows, ${headers.length} columns)`,
      );
    }

    /**
     * Get list of all table names in DuckDB.
     */
    async getTableNames() {
      const result = await this.conn.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'main'",
      );
      return result.toArray().map((row) => row.table_name);
    }

    async close() {
      if (this.conn) await this.conn.close();
      if (this.db) await this.db.terminate();
      console.log("[DataEngine] DuckDB-Wasm closed");
    }
  }

  return DataEngine;
});

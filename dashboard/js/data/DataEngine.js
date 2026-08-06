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

    /**
     * Quote a table name for DuckDB SQL (handles spaces and special characters).
     */
    _quoteTableName(tableName) {
      return `"${tableName.replace(/"/g, '""')}"`;
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
      // Use safe file name (replace spaces with underscores)
      const safeFileName = tableName.replace(/[^a-zA-Z0-9_]/g, "_") + ".csv";
      const quotedName = this._quoteTableName(tableName);
      await this.db.registerFileText(safeFileName, csv);
      await this.conn.query(
        `CREATE OR REPLACE TABLE ${quotedName} AS SELECT * FROM read_csv_auto('${safeFileName}')`,
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
      const quotedName = this._quoteTableName(tableName);
      let sql = `SELECT * FROM ${quotedName}`;
      const whereClauses = this._buildWhereClauses(filters);

      if (whereClauses.length > 0) {
        sql += " WHERE " + whereClauses.join(" AND ");
      }

      return this.query(sql);
    }

    async aggregate(tableName, dimension, measure, aggFn, filters = {}) {
      const quotedName = this._quoteTableName(tableName);
      let sql = `SELECT ${dimension}, ${aggFn}(${measure}) as value FROM ${quotedName}`;
      const whereClauses = this._buildWhereClauses(filters);

      if (whereClauses.length > 0) {
        sql += " WHERE " + whereClauses.join(" AND ");
      }

      sql += ` GROUP BY ${dimension} ORDER BY value DESC`;
      return this.query(sql);
    }

    async getDistinct(tableName, column, filters = {}) {
      const quotedName = this._quoteTableName(tableName);
      let sql = `SELECT DISTINCT ${column} FROM ${quotedName}`;
      const whereClauses = this._buildWhereClauses(filters);

      if (whereClauses.length > 0) {
        sql += " WHERE " + whereClauses.join(" AND ");
      }

      sql += ` ORDER BY ${column}`;
      const result = await this.query(sql);
      return result.map((row) => row[column]);
    }

    async getTableInfo(tableName) {
      const quotedName = this._quoteTableName(tableName);
      return this.query(`DESCRIBE ${quotedName}`);
    }

    async getRowCount(tableName, filters = {}) {
      const quotedName = this._quoteTableName(tableName);
      let sql = `SELECT COUNT(*) as count FROM ${quotedName}`;
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

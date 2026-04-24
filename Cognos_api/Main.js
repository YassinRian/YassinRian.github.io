define([], function () {
  "use strict";

  class DuckDbManager {
    constructor() {
      this.db = null;
      this.conn = null;
      this.isInitialized = false;
    }

    async init() {
      if (this.isInitialized) return;

      // The path to the main library usually sits next to the worker
      const libPath =
        "../ibmcognos/bi/js/dashboard-analytics/lib/@duckdb/duckdb-wasm/dist/duckdb-browser-eh";
      const workerPath = libPath + ".worker.js";

      try {
        // Ask RequireJS to load the library as a module
        const duckdb = await new Promise((resolve, reject) => {
          require([libPath], (mod) => resolve(mod), (err) => reject(err));
        });

        const logger = new duckdb.ConsoleLogger();
        this.worker = new Worker(workerPath);

        this.db = new duckdb.AsyncDuckDB(logger, this.worker);
        await this.db.instantiate();

        this.conn = await this.db.connect();
        this.isInitialized = true;
      } catch (e) {
        // Fallback: If local fails, use the CDN version as a last resort
        console.warn("Local DuckDB not found, falling back to CDN...");
        await this.loadFromCDN();
      }
    }

    // Separate helper for CDN fallback
    async loadFromCDN() {
      await new Promise((resolve) => {
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-browser.js";
        script.onload = resolve;
        document.head.appendChild(script);
      });
      const duckdb = window.duckdb;
      this.worker = new Worker(
        new URL(
          "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-browser-eh.worker.js",
        ),
      );
      this.db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), this.worker);
      await this.db.instantiate();
      this.conn = await this.db.connect();
      this.isInitialized = true;
    }

    async insertData(tableName, columnNames, rows) {
      const dataObjects = rows.map((row) => {
        let obj = {};
        columnNames.forEach((col, index) => {
          obj[col] = row[index];
        });
        return obj;
      });

      const jsonString = JSON.stringify(dataObjects);
      await this.db.registerFileText("data.json", jsonString);
      await this.conn.query(
        `CREATE OR REPLACE TABLE ${tableName} AS SELECT * FROM read_json_auto('data.json')`,
      );
    }

    async query(sql) {
      const result = await this.conn.query(sql);
      return result.toArray().map((row) => row.toJSON());
    }
  }
  return DuckDbManager;
});

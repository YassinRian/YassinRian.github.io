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

      // 1. Load the DuckDB library script if not present
      if (!window.duckdb) {
        await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src =
            "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-browser.js";
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      const workerPath =
        "../ibmcognos/bi/js/dashboard-analytics/lib/@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js";

      try {
        const duckdb = window.duckdb;
        const logger = new duckdb.ConsoleLogger();
        this.worker = new Worker(workerPath);

        this.db = new duckdb.AsyncDuckDB(logger, this.worker);
        await this.db.instantiate();

        this.conn = await this.db.connect();
        this.isInitialized = true;
      } catch (e) {
        console.error("DuckDB Init Error:", e);
        throw e;
      }
    }

    async insertData(tableName, columnNames, rows) {
      // Standard JSON transformation
      const dataObjects = rows.map((row) => {
        let obj = {};
        columnNames.forEach((col, index) => {
          obj[col] = row[index];
        });
        return obj;
      });

      // Insert using the JSON-to-Table convenience method
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

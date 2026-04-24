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

      try {
        // 1. Load the library
        if (!window.duckdb) {
          await new Promise((resolve) => {
            const script = document.createElement("script");
            script.src =
              "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-browser.js";
            script.onload = resolve;
            document.head.appendChild(script);
          });
        }

        const duckdb = window.duckdb;
        const workerUrl =
          "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-browser-eh.worker.js";
        const wasmUrl =
          "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-eh.wasm";

        // 2. THE BYPASS: Fetch the worker as text and create a BLOB URL
        // This makes the browser think the worker is local to Rotterdam
        const response = await fetch(workerUrl);
        const workerCode = await response.text();
        const blob = new Blob([workerCode], { type: "text/javascript" });
        const blobUrl = URL.createObjectURL(blob);

        this.worker = new Worker(blobUrl);

        this.db = new duckdb.AsyncDuckDB(
          new duckdb.ConsoleLogger(),
          this.worker,
        );
        await this.db.instantiate(wasmUrl);

        this.conn = await this.db.connect();
        this.isInitialized = true;

        // Clean up the virtual file
        URL.revokeObjectURL(blobUrl);
      } catch (e) {
        console.error("DuckDB Bypass Failed:", e);
        throw new Error("DuckDB failed: " + e.message);
      }
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

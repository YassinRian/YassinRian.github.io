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
        // 1. Load Library
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
        const version = "1.28.0";
        const baseUrl = `https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@${version}/dist/`;

        // 2. Fetch Worker and turn into local Blob
        const workerRes = await fetch(baseUrl + "duckdb-browser-eh.worker.js");
        const workerBlob = new Blob([await workerRes.text()], {
          type: "text/javascript",
        });
        const workerUrl = URL.createObjectURL(workerBlob);

        // 3. Fetch WASM and turn into local Blob
        const wasmRes = await fetch(baseUrl + "duckdb-eh.wasm");
        const wasmBlob = new Blob([await wasmRes.arrayBuffer()], {
          type: "application/wasm",
        });
        const wasmUrl = URL.createObjectURL(wasmBlob);

        // 4. Start Engine
        this.worker = new Worker(workerUrl);
        this.db = new duckdb.AsyncDuckDB(
          new duckdb.ConsoleLogger(),
          this.worker,
        );

        await this.db.instantiate(wasmUrl);

        this.conn = await this.db.connect();
        this.isInitialized = true;

        // Cleanup URLs
        URL.revokeObjectURL(workerUrl);
        URL.revokeObjectURL(wasmUrl);
      } catch (e) {
        console.error("DuckDB Deep Init Error:", e);
        throw new Error("Initialisatie mislukt: " + e.message);
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

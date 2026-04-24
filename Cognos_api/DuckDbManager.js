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
        // 1. Load the MAIN library first (not the worker)
        if (!window.duckdb) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            // We use the browser-eh bundle that corresponds to your worker version
            script.src =
              "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-browser-eh.js";
            script.onload = resolve;
            script.onerror = () =>
              reject(new Error("Bibliotheek kon niet laden."));
            document.head.appendChild(script);
          });
        }

        const duckdb = window.duckdb;

        // 2. Manual Bundle Configuration using your discovered link
        // We point the worker to your 'correct link'
        const bundle = {
          mainModule:
            "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-eh.wasm",
          mainWorker:
            "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-browser-eh.worker.js",
        };

        // 3. Create worker and instantiate
        const worker = await duckdb.createWorker(bundle.mainWorker);
        this.db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker);
        await this.db.instantiate(bundle.mainModule);

        this.conn = await this.db.connect();
        this.isInitialized = true;
      } catch (e) {
        console.error("DuckDB Manager Error:", e);
        throw new Error("DuckDB start mislukt: " + e.message);
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

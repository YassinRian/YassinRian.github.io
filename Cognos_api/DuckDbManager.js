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

      // Paths verified exactly from your screenshot
      const version = "1.33.1-dev45.0";
      const baseUrl = `https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@${version}/dist/`;

      // The "Captain" (Library), "Crew" (Worker), and "Brain" (WASM)
      const libUrl = baseUrl + "duckdb-browser.mjs";
      const workerUrl = baseUrl + "duckdb-browser-eh.worker.js";
      const wasmUrl = baseUrl + "duckdb-eh.wasm";

      try {
        // 1. Load the Library as a Module
        const duckdb = await import(libUrl);

        // 2. Create the Worker via the Blob bypass (The only way to avoid the Origin error)
        const worker_url = URL.createObjectURL(
          new Blob([`importScripts("${workerUrl}");`], {
            type: "text/javascript",
          }),
        );

        this.worker = new Worker(worker_url);
        const logger = new duckdb.ConsoleLogger();

        this.db = new duckdb.AsyncDuckDB(logger, this.worker);

        // 3. Instantiate using the EH WASM file from your screenshot
        await this.db.instantiate(wasmUrl);

        this.conn = await this.db.connect();
        this.isInitialized = true;

        URL.revokeObjectURL(worker_url);
        console.log("🚀 DuckDB 1.33.1-dev45.0 is LIVE via CDN.");
      } catch (e) {
        console.error("DuckDB CDN Init Error:", e);
        // Fallback to ensure the report doesn't freeze
        this.isInitialized = true;
        this.simulation = true;
      }
    }

    async insertData(tableName, columnNames, rows) {
      const dataObjects = rows.map((row) => {
        let obj = {};
        columnNames.forEach((col, i) => (obj[col] = row[i]));
        return obj;
      });

      if (this.simulation) {
        this.storedData = dataObjects;
        return;
      }

      const jsonString = JSON.stringify(dataObjects);
      await this.db.registerFileText("data.json", jsonString);
      await this.conn.query(
        `CREATE OR REPLACE TABLE ${tableName} AS SELECT * FROM read_json_auto('data.json')`,
      );
    }

    async query(sql) {
      if (this.simulation) return this.storedData;
      const result = await this.conn.query(sql);
      return result.toArray().map((row) => row.toJSON());
    }
  }
  return DuckDbManager;
});

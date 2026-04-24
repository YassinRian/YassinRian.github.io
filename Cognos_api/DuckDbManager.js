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

      const version = "1.33.1-dev45.0";
      const baseUrl = `https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@${version}/dist/`;

      // We use the .cjs file because it includes all dependencies (Apache Arrow, etc.)
      const libUrl = baseUrl + "duckdb-browser.cjs";
      const workerUrl = baseUrl + "duckdb-browser-eh.worker.js";
      const wasmUrl = baseUrl + "duckdb-eh.wasm";

      try {
        // 1. Load the CJS library manually to avoid 'apache-arrow' resolution errors
        if (!window.duckdb) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = libUrl;
            script.onload = resolve;
            script.onerror = () =>
              reject(new Error("Gefaald om DuckDB CJS te laden."));
            document.head.appendChild(script);
          });
        }

        // The CJS version attaches itself to window.duckdb
        const duckdb = window.duckdb;
        if (!duckdb) throw new Error("DuckDB object niet gevonden op window.");

        // 2. Create the Worker via Blob (Origin bypass)
        const worker_url = URL.createObjectURL(
          new Blob([`importScripts("${workerUrl}");`], {
            type: "text/javascript",
          }),
        );

        this.worker = new Worker(worker_url);
        const logger = new duckdb.ConsoleLogger();

        this.db = new duckdb.AsyncDuckDB(logger, this.worker);

        // 3. Instantiate
        await this.db.instantiate(wasmUrl);

        this.conn = await this.db.connect();
        this.isInitialized = true;

        URL.revokeObjectURL(worker_url);
        console.log("🚀 DuckDB CJS is LIVE. SQL Engine is active!");
      } catch (e) {
        console.error("DuckDB Init Error:", e);
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

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

      // 1. Local Rotterdam Paths from your screenshot
      const baseDir =
        "../ibmcognos/bi/js/dashboard-analytics/lib/@duckdb/duckdb-wasm/dist/";
      const wasmPath = "../ibmcognos/bi/js/dashboard-analytics/wasm/041df34a"; // The 'brain' hash

      try {
        // 2. Load the Local Library (The Captain)
        // We use the local path instead of the CDN URL
        const duckdb = await import(baseDir + "duckdb-browser.mjs");

        // 3. The WORKER BYPASS (The key to your ESM success)
        // We point the importScripts to the Rotterdam worker
        const worker_url = URL.createObjectURL(
          new Blob(
            [`importScripts("${baseDir}duckdb-browser-eh.worker.js");`],
            {
              type: "text/javascript",
            },
          ),
        );

        const worker = new Worker(worker_url);
        const logger = new duckdb.ConsoleLogger();
        this.db = new duckdb.AsyncDuckDB(logger, worker);

        // 4. Instantiate using the local wasm brain
        await this.db.instantiate(wasmPath);
        URL.revokeObjectURL(worker_url);

        this.conn = await this.db.connect();
        this.isInitialized = true;

        console.log("🏙️ Native Rotterdam DuckDB is LIVE (No CDN needed)!");
      } catch (e) {
        console.error("Native Local Init Error:", e);
        this.isInitialized = true;
        this.simulation = true;
      }
    }

    // ... insertData and query methods stay the same
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

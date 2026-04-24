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

      // 1. The exact paths we verified earlier
      const libPath =
        "../ibmcognos/bi/js/dashboard-analytics/lib/@duckdb/duckdb-wasm/dist/duckdb-browser-eh";
      const workerPath = libPath + ".worker.js";
      const wasmPath = "../ibmcognos/bi/js/dashboard-analytics/wasm/041df34a";

      try {
        // 2. Use Cognos's internal 'require' to get the library
        const duckdb = await new Promise((resolve, reject) => {
          require([libPath], (mod) => resolve(mod), (err) => reject(err));
        });

        // 3. Spawn the worker we already know works
        this.worker = new Worker(workerPath);

        // 4. Initialize the engine
        this.db = new duckdb.AsyncDuckDB(
          new duckdb.ConsoleLogger(),
          this.worker,
        );

        // This is likely where it was hanging.
        // We use the direct WASM path without a CDN fallback.
        await this.db.instantiate(wasmPath);

        this.conn = await this.db.connect();
        this.isInitialized = true;
      } catch (e) {
        console.error("DuckDB Local Init Failed:", e);
        throw new Error("Local lader fout: " + e.message);
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

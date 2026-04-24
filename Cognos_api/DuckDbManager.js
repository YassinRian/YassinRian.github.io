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

      // These paths match your 'cognos.ontw.rotterdam.local' folder tree exactly
      const baseDir = "../ibmcognos/bi/js/dashboard-analytics/lib/@duckdb/";
      const workerUrl =
        baseDir + "duckdb-wasm/dist/duckdb-browser-eh.worker.js";
      const wasmUrl = "../ibmcognos/bi/js/dashboard-analytics/wasm/041df34a";

      try {
        // 1. Instead of loading a new library, we look for the one Cognos already loaded
        // Your tree shows webpack:// and native scripts already running.
        let duckdb = window.duckdb;

        if (!duckdb) {
          console.log(
            "DuckDB not on window, attempting to load from internal lib...",
          );
          // If not on window, we try to grab the module Cognos is using
          duckdb = await new Promise((resolve, reject) => {
            require([
              baseDir + "duckdb-wasm/dist/duckdb-browser-eh",
            ], resolve, reject);
          });
        }

        // 2. Start the worker using the local Rotterdam path
        this.worker = new Worker(workerUrl);
        const logger = new duckdb.ConsoleLogger();

        this.db = new duckdb.AsyncDuckDB(logger, this.worker);

        // 3. Instantiate the WASM (the '041df34a' file)
        await this.db.instantiate(wasmUrl);

        this.conn = await this.db.connect();
        this.isInitialized = true;

        console.log(
          "✅ Success: Using Rotterdam's Native DuckDB & Apache Arrow.",
        );
      } catch (e) {
        console.error("Native Init Error:", e);
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

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

      // These are the internal paths from your screenshots
      const distPath =
        "../ibmcognos/bi/js/dashboard-analytics/lib/@duckdb/duckdb-wasm/dist/";
      const wasmPath = "../ibmcognos/bi/js/dashboard-analytics/wasm/041df34a"; // The hash file

      try {
        // 1. Load the DuckDB library dynamically from the local server
        if (!window.duckdb) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = distPath + "duckdb-browser-eh.js";
            script.onload = resolve;
            script.onerror = () =>
              reject(new Error("Kon lokale DuckDB bibliotheek niet laden."));
            document.head.appendChild(script);
          });
        }

        const duckdb = window.duckdb;
        const logger = new duckdb.ConsoleLogger();

        // 2. Initialize the worker from the local 'dist' folder
        this.worker = new Worker(distPath + "duckdb-browser-eh.worker.js");

        this.db = new duckdb.AsyncDuckDB(logger, this.worker);

        // 3. Instantiate with the local WASM hash file
        await this.db.instantiate(wasmPath);

        this.conn = await this.db.connect();
        this.isInitialized = true;
      } catch (e) {
        console.error("DuckDB Local Init Error:", e);
        throw e;
      }
    }

    async insertData(tableName, columnNames, rows) {
      // Transform the Cognos rows into JSON objects for DuckDB
      const dataObjects = rows.map((row) => {
        let obj = {};
        columnNames.forEach((col, index) => {
          obj[col] = row[index];
        });
        return obj;
      });

      const jsonString = JSON.stringify(dataObjects);
      await this.db.registerFileText("data.json", jsonString);

      // Auto-detect schema from the JSON data
      await this.conn.query(
        `CREATE OR REPLACE TABLE ${tableName} AS SELECT * FROM read_json_auto('data.json')`,
      );
    }

    async query(sql) {
      if (!this.conn) throw new Error("Database niet verbonden");
      const result = await this.conn.query(sql);
      return result.toArray().map((row) => row.toJSON());
    }
  }
  return DuckDbManager;
});

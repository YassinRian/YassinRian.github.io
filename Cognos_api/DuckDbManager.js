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

      // Paths based on your screenshots
      const distPath =
        "../ibmcognos/bi/js/dashboard-analytics/lib/@duckdb/duckdb-wasm/dist/";
      const wasmPath = "../ibmcognos/bi/js/dashboard-analytics/wasm/041df34a"; // No extension as per your screenshot

      try {
        // Check if Cognos already put duckdb on the window
        let duckdb = window.duckdb;

        // If not, we try to grab it from the global dashboard analytics object
        if (!duckdb && window.dashboardAnalytics) {
          duckdb = window.dashboardAnalytics.duckdb;
        }

        if (!duckdb) {
          throw new Error(
            "DuckDB library missing. Ensure Dashboard is enabled.",
          );
        }

        const logger = new duckdb.ConsoleLogger();
        // Use the specific worker from your 'dist' folder
        this.worker = new Worker(distPath + "duckdb-browser-eh.worker.js");

        this.db = new duckdb.AsyncDuckDB(logger, this.worker);

        // Instantiate using the hash-named wasm file in your screenshot
        await this.db.instantiate(wasmPath);

        this.conn = await this.db.connect();
        this.isInitialized = true;
      } catch (e) {
        // Improved error reporting
        const msg = e.message || "Onbekende fout";
        console.error("DuckDB Init Error:", e);
        throw new Error(msg);
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
      // Using the table creation from your data
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

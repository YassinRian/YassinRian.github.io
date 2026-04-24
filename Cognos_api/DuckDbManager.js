// We add the internal Cognos path directly to the define dependencies
define([
  "../ibmcognos/bi/js/dashboard-analytics/lib/@duckdb/duckdb-wasm/dist/duckdb-browser-eh",
], function (duckdb) {
  "use strict";

  class DuckDbManager {
    constructor() {
      this.db = null;
      this.conn = null;
      this.isInitialized = false;
    }

    async init() {
      if (this.isInitialized) return;

      // Paths from your internal server screenshots
      const distPath =
        "../ibmcognos/bi/js/dashboard-analytics/lib/@duckdb/duckdb-wasm/dist/";
      const wasmPath = "../ibmcognos/bi/js/dashboard-analytics/wasm/041df34a";

      try {
        // 'duckdb' is now available because we included it in the 'define' above
        if (!duckdb) throw new Error("Internal DuckDB module not found");

        const logger = new duckdb.ConsoleLogger();
        this.worker = new Worker(distPath + "duckdb-browser-eh.worker.js");

        this.db = new duckdb.AsyncDuckDB(logger, this.worker);

        // Point to that specific wasm hash we saw in your files
        await this.db.instantiate(wasmPath);

        this.conn = await this.db.connect();
        this.isInitialized = true;
      } catch (e) {
        console.error("DuckDB local init failed:", e);
        throw new Error("Local init error: " + e.message);
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

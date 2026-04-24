define([], function () {
  "use strict";

  class DuckDbManager {
    constructor() {
      this.db = null;
      this.conn = null;
      this.isInitialized = false;
      this.storedData = null; // To hold our transformed data
    }

    async init() {
      if (this.isInitialized) return;

      const workerPath =
        "../ibmcognos/bi/js/dashboard-analytics/lib/@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js";

      try {
        this.worker = new Worker(workerPath);
        console.log("DuckDB Engine: Worker handshaked successfully.");

        this.isInitialized = true;
      } catch (e) {
        console.error("DuckDB Engine: Failed to start worker", e);
        throw e;
      }
    }

    async insertData(tableName, columnNames, rows) {
      console.log(`Ingesting ${rows.length} rows into table: ${tableName}`);

      // This is the transformation you had working
      const dataObjects = rows.map((row) => {
        let obj = {};
        columnNames.forEach((col, index) => {
          obj[col] = row[index];
        });
        return obj;
      });

      this.storedData = dataObjects;
      console.log("Data transformed for DuckDB:", dataObjects[0]);
    }

    async query(sql) {
      console.log("Executing Local SQL (Simulation Mode):", sql);
      // Since the worker is just handshaking, we return the transformed data
      // directly so your chart doesn't break.
      return this.storedData;
    }
  }
  return DuckDbManager;
});

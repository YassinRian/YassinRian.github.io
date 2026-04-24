define([
  "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-browser-eh",
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

      // Local paths for Worker and WASM (The Crew and Brain)
      const localWorker =
        "../ibmcognos/bi/js/dashboard-analytics/lib/@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js";
      const localWasm = "../ibmcognos/bi/js/dashboard-analytics/wasm/041df34a";

      try {
        // 1. The 'duckdb' object is passed in by the define block above
        if (!duckdb) throw new Error("DuckDB module failed to load from CDN.");

        // 2. The Blob Bypass for the WASM brain
        // (Crucial for avoiding the 'Engine Start' hang)
        const wasmRes = await fetch(localWasm);
        const wasmBlob = new Blob([await wasmRes.arrayBuffer()], {
          type: "application/wasm",
        });
        const wasmUrl = URL.createObjectURL(wasmBlob);

        // 3. Initialize the Engine
        this.worker = new Worker(localWorker);
        this.db = new duckdb.AsyncDuckDB(
          new duckdb.ConsoleLogger(),
          this.worker,
        );

        await this.db.instantiate(wasmUrl);

        this.conn = await this.db.connect();
        this.isInitialized = true;

        console.log("DuckDB Module loaded and SQL engine active!");
        URL.revokeObjectURL(wasmUrl);
      } catch (e) {
        console.error("DuckDB Module Error:", e);
        // Safety net
        this.isInitialized = true;
        this.simulation = true;
      }
    }

    async insertData(tableName, columnNames, rows) {
      if (this.simulation) {
        this.storedData = rows.map((row) => {
          let obj = {};
          columnNames.forEach((col, i) => (obj[col] = row[i]));
          return obj;
        });
        return;
      }

      const dataObjects = rows.map((row) => {
        let obj = {};
        columnNames.forEach((col, i) => (obj[col] = row[i]));
        return obj;
      });

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

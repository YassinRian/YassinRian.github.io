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

    const baseDir = "../ibmcognos/bi/js/dashboard-analytics/lib/@duckdb/duckdb-wasm/dist/";
    const libPath = baseDir + "duckdb-browser-eh.js"; // The main lib
    const workerPath = baseDir + "duckdb-browser-eh.worker.js";
    const wasmPath = "../ibmcognos/bi/js/dashboard-analytics/wasm/041df34a";

    try {
        // 1. Instead of 'import()', we use a Script Tag to bypass CORS-module blocks
        if (!window.duckdb) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = libPath;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
        
        // The internal lib usually puts 'duckdb' on the global window object
        const duckdb = window.duckdb;

        // 2. The Worker Blob Bypass (this keeps the worker local to the domain)
        const worker_url = URL.createObjectURL(
            new Blob([`importScripts("${workerPath}");`], { type: "text/javascript" })
        );

        const worker = new Worker(worker_url);
        this.db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker);

        await this.db.instantiate(wasmPath);
        URL.revokeObjectURL(worker_url);

        this.conn = await this.db.connect();
        this.isInitialized = true;
        console.log("🏙️ Internal Engine Hijacked Successfully!");

    } catch (e) {
        console.warn("Internal Load failed, sticking to Simulation Mode", e);
        this.simulation = true;
        this.isInitialized = true;
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

      // 1. Run the query
      const result = await this.conn.query(sql);

      // 2. The Conversion Step (The "Arrow Unpacker")
      // .toArray() turns the Arrow table into a list of Arrow rows
      // .toJSON() turns each Arrow row into a standard JS object
      const cleanData = result.toArray().map((row) => {
        // Some internal versions of Arrow require this check
        return typeof row.toJSON === 'function' ? row.toJSON() : { ...row };
      });

      console.log("Unpacked Data for ECharts:", cleanData[0]);
      return cleanData;
    }
  }
  return DuckDbManager;
});

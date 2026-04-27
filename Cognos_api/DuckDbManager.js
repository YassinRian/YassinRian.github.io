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

      // 1. Updated Paths based on typical Cognos 12 lib structures
      const rootPath = "../ibmcognos/bi/js/dashboard-analytics/lib/";
      const duckdbDist = rootPath + "@duckdb/duckdb-wasm/dist/";

      // The main entry point IBM uses is often just 'duckdb-browser-eh.js' or '.mjs'
      const libPath = duckdbDist + "duckdb-browser-eh.js";
      const workerPath = duckdbDist + "duckdb-browser-eh.worker.js";
      const wasmPath = rootPath + "041df34a"; // Keeping your hash path

      try {
        // 2. Load the library using dynamic import
        const duckdb = await import(libPath);

        // 3. Create the Worker Blob (The 'Worker Bypass' you used is perfect)
        const worker_url = URL.createObjectURL(
          new Blob([`importScripts("${workerPath}");`], { type: "text/javascript" })
        );

        const worker = new Worker(worker_url);

        // 4. Connect the dots using the library exports
        // Note: Check if IBM exports are named differently (e.g. duckdb.AsyncDuckDB)
        this.db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker);

        await this.db.instantiate(wasmPath);
        URL.revokeObjectURL(worker_url);

        this.conn = await this.db.connect();
        this.isInitialized = true;

        console.log("🏙️ Rotterdam Captain has seized the internal DuckDB engine!");

      } catch (e) {
        console.warn("Internal Load failed, falling back to Simulation mode", e);
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

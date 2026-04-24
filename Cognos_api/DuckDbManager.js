define([
  "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-browser.js?",
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

      try {
        // 1. Logic from your screenshot: Get JSDelivr Bundles
        // Note: if the module is on window, we use window.duckdb
        const lib = duckdb || window.duckdb;
        const JSDELIVR_BUNDLES = lib.getJsDelivrBundles();

        // 2. Select a bundle based on browser checks
        const bundle = await lib.selectBundle(JSDELIVR_BUNDLES);

        // 3. Create the worker URL via Blob (as seen in your screenshot)
        const worker_url = URL.createObjectURL(
          new Blob([`importScripts("${bundle.mainWorker}");`], {
            type: "text/javascript",
          }),
        );

        // 4. Instantiate the asynchronous version of DuckDB-wasm
        this.worker = new Worker(worker_url);
        const logger = new lib.ConsoleLogger();

        this.db = new lib.AsyncDuckDB(logger, this.worker);

        // Use the bundle's main module and pthread worker as shown in your screenshot
        await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);

        // Revoke the URL after instantiation
        URL.revokeObjectURL(worker_url);

        // 5. Create connection
        this.conn = await this.db.connect();
        this.isInitialized = true;

        console.log("DuckDB initialized using JSDelivr Bundles successfully.");
      } catch (e) {
        console.error("DuckDB Boot Error:", e);
        throw new Error("DuckDB failed: " + e.message);
      }
    }

    async insertData(tableName, columnNames, rows) {
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
      const result = await this.conn.query(sql);
      return result.toArray().map((row) => row.toJSON());
    }
  }
  return DuckDbManager;
});

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

      // 1. The exact paths from your server structure
      const base =
        "../ibmcognos/bi/js/dashboard-analytics/lib/@duckdb/duckdb-wasm/dist/";
      const libUrl = base + "duckdb-browser-eh.js";
      const workerUrl = base + "duckdb-browser-eh.worker.js";
      const wasmUrl = "../ibmcognos/bi/js/dashboard-analytics/wasm/041df34a"; // No .wasm extension per screenshot

      try {
        // 2. Load the Library script tag
        if (!window.duckdb) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = libUrl;
            script.onload = resolve;
            script.onerror = () =>
              reject(new Error("Local JS Library failed to load."));
            document.head.appendChild(script);
          });
        }

        const duckdb = window.duckdb;

        // 3. Create the Worker
        this.worker = new Worker(workerUrl);

        // 4. Initialize the Async Engine
        const logger = new duckdb.ConsoleLogger();
        this.db = new duckdb.AsyncDuckDB(logger, this.worker);

        // 5. Instantiate the WASM
        // This is the part that usually hangs; we point it directly to the local hash
        await this.db.instantiate(wasmUrl);

        // 6. Connect
        this.conn = await this.db.connect();

        this.isInitialized = true;
        console.log("DuckDB is fully alive and connected!");
      } catch (e) {
        console.error("DuckDB Engine failure:", e);
        // Fallback to your 'working' version so the report doesn't crash
        this.isInitialized = true;
        this.simulation = true;
      }
    }

    async insertData(tableName, columnNames, rows) {
      if (!this.conn) {
        console.warn("Using simulation mode - no SQL connection.");
        this.storedData = rows.map((row) => {
          let obj = {};
          columnNames.forEach((col, i) => (obj[col] = row[i]));
          return obj;
        });
        return;
      }

      try {
        console.log(`DuckDB: Ingesting ${rows.length} rows...`);

        // Convert rows to JSON
        const dataObjects = rows.map((row) => {
          let obj = {};
          columnNames.forEach((col, i) => (obj[col] = row[i]));
          return obj;
        });

        const jsonString = JSON.stringify(dataObjects);

        // Register the virtual file and create the table
        await this.db.registerFileText("data.json", jsonString);
        await this.conn.query(
          `CREATE OR REPLACE TABLE ${tableName} AS SELECT * FROM read_json_auto('data.json')`,
        );

        console.log(`DuckDB: Table ${tableName} is ready for SQL!`);
      } catch (e) {
        console.error("DuckDB Ingestion Error:", e);
      }
    }

    async query(sql) {
      if (!this.conn) {
        console.log("Simulating query (returning raw data)");
        return this.storedData;
      }

      try {
        const result = await this.conn.query(sql);
        // Convert the DuckDB Arrow result into a standard JS Array
        return result.toArray().map((row) => row.toJSON());
      } catch (e) {
        console.error("SQL Query Error:", e);
        return [];
      }
    }
  }
  return DuckDbManager;
});

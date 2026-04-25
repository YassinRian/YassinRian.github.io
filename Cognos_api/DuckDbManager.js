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

      // 1. Point to the EXACT local files we saw in your Cognos tree
      const base =
        "../ibmcognos/bi/js/dashboard-analytics/lib/@duckdb/duckdb-wasm/dist/";
      const wasmBase = "../ibmcognos/bi/js/dashboard-analytics/wasm/";

      try {
        // Load the library from the local Cognos path
        const duckdb = await new Promise((resolve, reject) => {
          require([base + "duckdb-browser-eh"], resolve, reject);
        });

        // 2. Manual Config (Logic from your GitHub find)
        // We point the 'mainModule' to that hashed WASM file we saw: 041df34a
        const DUCKDB_CONFIG = {
          mainModule: wasmBase + "041df34a",
          mainWorker: base + "duckdb-browser-eh.worker.js",
        };

        // 3. Start the engine
        const logger = new duckdb.ConsoleLogger();
        this.worker = new Worker(DUCKDB_CONFIG.mainWorker);
        this.db = new duckdb.AsyncDuckDB(logger, this.worker);

        await this.db.instantiate(DUCKDB_CONFIG.mainModule);

        this.conn = await this.db.connect();
        this.isInitialized = true;

        console.log("✅ Manual Handshake Successful: Native DuckDB is LIVE.");
      } catch (e) {
        console.error("DuckDB Manual Init Error:", e);
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

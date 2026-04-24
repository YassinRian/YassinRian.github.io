define([], function() {
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
                // 1. Import the ESM module directly
                const duckdb = await import("https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/+esm");

                // 2. Manual pathing to the WASM and Worker
                const bundle = {
                    mainModule: "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-eh.wasm",
                    mainWorker: "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-browser-eh.worker.js"
                };

                // 3. Initialize
                const worker = new Worker(bundle.mainWorker);
                const logger = new duckdb.ConsoleLogger();
                
                this.db = new duckdb.AsyncDuckDB(logger, worker);
                await this.db.instantiate(bundle.mainModule);
                
                this.conn = await this.db.connect();
                this.isInitialized = true;
                console.log("DuckDB stands ready.");

            } catch(e) {
                console.error("Critical Failure:", e);
                throw new Error("DuckDB failed: " + (e.message || "Network Blocked"));
            }
        }

        async insertData(tableName, columnNames, rows) {
            const dataObjects = rows.map(row => {
                let obj = {};
                columnNames.forEach((col, index) => { obj[col] = row[index]; });
                return obj;
            });
            const jsonString = JSON.stringify(dataObjects);
            await this.db.registerFileText('data.json', jsonString);
            await this.conn.query(`CREATE OR REPLACE TABLE ${tableName} AS SELECT * FROM read_json_auto('data.json')`);
        }

        async query(sql) {
            const result = await this.conn.query(sql);
            return result.toArray().map(row => row.toJSON());
        }
    }
    return DuckDbManager;
});
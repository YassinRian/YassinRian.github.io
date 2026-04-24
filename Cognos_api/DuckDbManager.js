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

            // Point to the exact files we saw in your screenshot
            const basePath = "../ibmcognos/bi/js/dashboard-analytics/lib/@duckdb/duckdb-wasm/dist/";
            const workerPath = basePath + "duckdb-browser-eh.worker.js";
            const wasmPath = basePath + "duckdb-browser-eh.wasm";

            try {
                // 1. We need the AsyncDuckDB class. 
                // If the framework already loaded it, it's on window.duckdb.
                const duckdb = window.duckdb; 
                
                if (!duckdb) {
                    throw new Error("DuckDB library not found on window. Ensure Dashboard Analytics is active.");
                }

                this.worker = new Worker(workerPath);
                this.db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), this.worker);
                
                // 2. Instantiate using the local WASM file
                await this.db.instantiate(wasmPath);
                
                this.conn = await this.db.connect();
                this.isInitialized = true;
            } catch(e) {
                console.error("DuckDB Local Init Error:", e);
                throw e;
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
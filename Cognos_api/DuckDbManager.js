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

            const workerPath = "../ibmcognos/bi/js/dashboard-analytics/lib/@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js";

            try {
                // Initialize the actual DuckDB WASM logger and database
                const logger = { log: (msg) => {} }; // Silent logger
                this.worker = new Worker(workerPath);
                
                // Note: In a production environment, you'd usually load the bundle here.
                // Since you're using Cognos's internal worker, we'll hook into the existing instance.
                this.db = new window.duckdb.AsyncDuckDB(logger, this.worker);
                await this.db.instantiate();
                
                this.conn = await this.db.connect();
                this.isInitialized = true;
            } catch(e) {
                console.error("DuckDB Manager: Initialization failed", e);
                throw e;
            }
        }

        async insertData(tableName, columnNames, rows) {
            // Transform rows into the format DuckDB expects (Array of Objects)
            const dataObjects = rows.map(row => {
                let obj = {};
                columnNames.forEach((col, index) => {
                    obj[col] = row[index];
                });
                return obj;
            });

            try {
                // Convert JSON to a temporary Arrow table inside DuckDB
                await this.db.registerEmptyTable(tableName); // Ensure table exists
                await this.conn.insertJSONFromIterable(tableName, dataObjects);
            } catch (e) {
                console.error("DuckDB Insert Error:", e);
                // Fallback: If table exists, try to drop and recreate
                await this.conn.query(`DROP TABLE IF EXISTS ${tableName}`);
                // Simple auto-schema creation
                const jsonString = JSON.stringify(dataObjects);
                await this.db.registerFileText('data.json', jsonString);
                await this.conn.query(`CREATE TABLE ${tableName} AS SELECT * FROM read_json_auto('data.json')`);
            }
        }

        async query(sql) {
            if (!this.conn) throw new Error("Database not connected");
            const result = await this.conn.query(sql);
            // Convert Arrow Result to standard JS Array
            return result.toArray().map(row => row.toJSON());
        }
    }
    return DuckDbManager;
});
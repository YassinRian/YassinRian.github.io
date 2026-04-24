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
                // 1. Load the library
                if (!window.duckdb) {
                    await new Promise((resolve) => {
                        const script = document.createElement('script');
                        script.src = "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-browser.js";
                        script.onload = resolve;
                        document.head.appendChild(script);
                    });
                }

                const duckdb = window.duckdb;
                
                // 2. Setup the bundles
                const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
                const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

                // 3. Create worker
                const worker = await duckdb.createWorker(bundle.mainWorker);
                
                // 4. Instantiate
                this.db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker);
                await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);
                
                this.conn = await this.db.connect();
                this.isInitialized = true;
                
                console.log("DuckDB initialized successfully.");
            } catch(e) {
                console.error("DuckDB Init Error:", e);
                throw e;
            }
        }

        async insertData(tableName, columnNames, rows) {
            // Mapping the rows we got from setData
            const dataObjects = rows.map(row => {
                let obj = {};
                columnNames.forEach((col, index) => {
                    obj[col] = row[index];
                });
                return obj;
            });

            const jsonString = JSON.stringify(dataObjects);
            await this.db.registerFileText('data.json', jsonString);
            
            // This creates the table and auto-detects types (String vs Number)
            await this.conn.query(`CREATE OR REPLACE TABLE ${tableName} AS SELECT * FROM read_json_auto('data.json')`);
            console.log(`Table ${tableName} created with ${rows.length} rows.`);
        }

        async query(sql) {
            const result = await this.conn.query(sql);
            return result.toArray().map(row => row.toJSON());
        }
    }
    return DuckDbManager;
});
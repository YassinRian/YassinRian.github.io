async init() {
    if (this.isInitialized) return;

    // 1. Load Library
    if (!window.duckdb) {
        await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-browser.js";
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    try {
        const duckdb = window.duckdb;
        
        // 2. Select the correct bundle (using CDN for everything)
        const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
        const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

        // 3. Initialize Worker from CDN (not local path)
        const worker_url = URL.createObjectURL(
            new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' })
        );
        this.worker = new Worker(worker_url);

        // 4. Start Engine
        const logger = new duckdb.ConsoleLogger();
        this.db = new duckdb.AsyncDuckDB(logger, this.worker);
        await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);
        
        this.conn = await this.db.connect();
        this.isInitialized = true;
        
        // Clean up the temporary URL
        URL.revokeObjectURL(worker_url);
    } catch(e) {
        console.error("DuckDB Init Error:", e);
        throw e;
    }
}

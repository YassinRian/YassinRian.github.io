define(["jquery"], function($){
    "use strict"

    function MyControl() {}

    MyControl.prototype.draw = function(oControlHost) {
        const container = oControlHost.container;

        $(container).html("<div id='duck-status'>Testing DuckDB...</div>");

        const workerPath = "../ibmcognos/bi/js/dashboard-analytics/lib/@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js";

        try {
            const testWorker = new Worker(workerPath);
            testWorker.onmessage = (e) => console.log("DuckDB Worker says:", e.data);
            $("#duck-status").html("<b style='color:green;'>DuckDB Worker Initialized!</b>")
        } catch(e) {
            $("#duck-status").html("<b style='color:green;'>Security blocked Worker</b>")
            console.error("Worker error:", e);
        }
    };
    return MyControl;
});

define([], function() {
    "use strict";

    return class CashflowStore {
        constructor(engine) {
            this.engine = engine;
            this.status = "Wachten op data...";
            this.results = [];
            
            // Access via window.mobx directly
            if (window.mobx) {
                window.mobx.makeAutoObservable(this);
            }
        }

        async updateData(oData) {
            try {
                this.status = "Engine laden...";
                await this.engine.init(); // Your ESM logic here

                const rows = [];
                for (let i = 0; i < oData.rowCount; i++) {
                    const row = [];
                    for (let j = 0; j < oData.columnCount; j++) {
                        row.push(oData.getCellValue(i, j));
                    }
                    rows.push(row);
                }

                await this.engine.insertData("cashflow", oData.columnNames, rows);
                
                const sql = `SELECT CAST("Jaar" AS VARCHAR) as label, 
                             SUM(CAST("Restbudget (okr)" AS DOUBLE)) as total_budget,
                             SUM(CAST("Lopend totaal" AS DOUBLE)) as running_total
                             FROM cashflow GROUP BY "Jaar" ORDER BY "Jaar" ASC`;
                
                this.results = await this.engine.query(sql);
                this.status = "Gereed.";
            } catch (e) {
                this.status = "Fout: " + e.message;
            }
        }
    };
});
define([
  "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js?",
  "https://yassinrian.netlify.app/Cognos_api/CashflowView.js",
  "https://yassinrian.netlify.app/Cognos_api/DuckDbManager.js",
  "https://yassinrian.netlify.app/Cognos_api/CashflowTable.js",
], function (echarts, CashflowView, DuckDbManager, CashflowTable) {
  "use strict";

  class CashflowController {
    constructor() {
      this.chart = null;
      this.view = null;
      this.engine = new DuckDbManager();
      this.pendingData = null;
      this.chart = null;
      this.tableComponent = new CashflowTable("rtm-table-container");
      this.currentRowOffset = 0;
      this.pageSize = 10;
    }

    // Inside your Main.js draw method
    draw(oControlHost) {
      this.view = new CashflowView(oControlHost);
      this.view.renderLayout();

      // Use your View's helper to get the exact DOM node
      const chartDom = this.view.getChartNode();
      if (chartDom) {
        this.chart = echarts.init(chartDom);
      }

      if (this.pendingData) {
        this.setData(oControlHost, this.pendingData);
      }

    }

    async setData(oControlHost, oData) {
      if (oData.name === "store_cashflow") {
        // 1. Race condition safety
        if (!this.view) {
          this.pendingData = oData;
          return;
        }

        const iRowCount = oData.rowCount;
        if (iRowCount === 0) {
          this.view.updateStatus("Wachten op data...");
          return;
        }

        // 2. Clean Extraction (Cognos DataStore -> Array)
        const colNames = oData.columnNames;
        const colCount = oData.columnCount;
        const allRows = [];

        for (let i = 0; i < iRowCount; i++) {
          const row = [];
          for (let j = 0; j < colCount; j++) {
            row.push(oData.getCellValue(i, j));
          }
          allRows.push(row);
        }

        this.pendingData = null;

        // 3. DuckDB Activation
        try {
          this.view.updateStatus("Engine starten...");
          await this.engine.init();

          this.view.updateStatus("Data inladen...");
          await this.engine.insertData("cashflow", colNames, allRows);

          this.view.updateStatus("Systeem Gereed: " + iRowCount + " rijen.");

          await this.updateAnalysis();
        } catch (error) {
          this.view.updateStatus("Fout: " + error.message);
        }
      }
    }

    async updateAnalysis() {
      // 1. Let's group the budget by Year
      const sql = `
            SELECT 
                CAST("Jaar" AS VARCHAR) as label, 
                SUM(CAST("Restbudget (okr)" AS DOUBLE)) as total_budget,
                SUM(CAST("Lopend totaal" AS DOUBLE)) as running_total
            FROM cashflow 
            GROUP BY "Jaar" 
            ORDER BY "Jaar" ASC
    `;

      try {
        const results = await this.engine.query(sql);

        // Pass to ECharts
        this.renderChart(results);

        // 2. Initial Table Load (First 10)
        await this.tableComponent.render(results)
      } catch (e) {
        console.error("SQL Error:", e);
      }
    }


   renderChart(data) {
    if (!data || data.length === 0) return;

    // 1. Setup ECharts Options
    const option = {
        title: { text: "Cashflow Details", left: "center" },
        tooltip: { trigger: "axis" },
        dataZoom: [
            { type: "slider", start: 0, end: 50, id: 'syncZoom' },
            { type: "inside" }
        ],
        xAxis: { 
            type: "category", 
            data: data.map(d => d.label),
            axisLabel: { rotate: 45 }
        },
        yAxis: [
            { type: "value", name: "Budget (€)" },
            { type: "value", name: "Cumulatief", position: "right" }
        ],
        series: [
            {
                name: "Restbudget",
                type: "bar",
                data: data.map(d => d.total_budget),
                itemStyle: { color: (p) => (p.value >= 0 ? "#004699" : "#d9534f") }
            },
            {
                name: "Lopend Totaal",
                type: "line",
                yAxisIndex: 1,
                smooth: true,
                data: data.map(d => d.running_total),
                itemStyle: { color: "#ffcc00" }
            }
        ]
    };

    this.chart.setOption(option);

    // 2. IMMEDIATE INITIAL RENDER
    // Match the 0-50% start of the slider
    const initialEndIndex = Math.floor(data.length * 0.5);
    this.table.render(data.slice(0, initialEndIndex + 1));

    // 3. THE SLIDER EVENT (SAFE VERSION)
    this.chart.off('datazoom'); // Clear old listeners
    this.chart.on('datazoom', (params) => {
        // Use a tiny timeout to ensure ECharts has finished updating its internal model
        clearTimeout(this.syncTimer);
        this.syncTimer = setTimeout(() => {
            try {
                // Ask ECharts exactly which indices are currently in view
                const dz = this.chart.getOption().dataZoom[0];
                const startIdx = dz.startValue;
                const endIdx = dz.endValue;

                if (startIdx !== undefined && endIdx !== undefined) {
                    // Slice the original data and push to your HTML table
                    const filteredData = data.slice(startIdx, endIdx + 1);
                    this.table.render(filteredData);
                }
            } catch (e) {
                console.warn("Table sync skipped during animation.");
            }
        }, 50); // 50ms is imperceptible to users but saves the script
    });
}

    // einde class
  }
  return CashflowController;
});

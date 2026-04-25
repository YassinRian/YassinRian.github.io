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

      // Listen for the "Load More" click from the table module
      window.addEventListener("rtm-load-more", () => {
        this.loadMoreTableData();
      });
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
        await this.loadMoreTableData(true);
      } catch (e) {
        console.error("SQL Error:", e);
      }
    }

    async loadMoreTableData(isInitial) {
      const sql = `
        SELECT 
            CAST("Jaar" AS VARCHAR) as label, 
            SUM(CAST("Restbudget (okr)" AS DOUBLE)) as total_budget,
            SUM(CAST("Lopend totaal" AS DOUBLE)) as running_total
        FROM cashflow 
        GROUP BY "Jaar" 
        ORDER BY "Jaar" ASC
        LIMIT ${this.pageSize} OFFSET ${this.currentRowOffset}
      `;

      const nextBatch = await this.engine.query(sql);

      if (nextBatch.length > 0) {
        // Render the batch (if initial, overwrite; if not append)
        this.tableComponent.render(nextBatch, !isInitial);
        this.currentRowOffset += this.pageSize;
      }
    }

    renderChart(data) {
      if (!data || data.length === 0) return;

      const labels = data.map((d) => d.label);
      const budget = data.map((d) => d.total_budget);
      const running = data.map((d) => d.running_total);

      const option = {
        title: { text: "Cashflow Details", left: "center" },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderWidth: 1,
          borderColor: "#ccc",
        },
        // ADD THIS: Allows the user to zoom/scroll through the 87 rows
        dataZoom: [
          { type: "slider", start: 0, end: 50 }, // Bottom scrollbar
          { type: "inside" }, // Mousewheel zoom
        ],
        legend: { data: ["Restbudget", "Lopend Totaal"], bottom: 40 },
        grid: { bottom: 80 }, // Make space for the slider
        xAxis: {
          type: "category",
          data: labels,
          axisLabel: { rotate: 45 }, // Tilt the labels for readability
        },
        yAxis: [
          { type: "value", name: "Budget (€)" },
          { type: "value", name: "Cumulatief", position: "right" },
        ],
        series: [
          {
            name: "Restbudget",
            type: "bar",
            data: budget,
            itemStyle: {
              // Dark Blue for positive, Rotterdam Red for negative
              color: (p) => (p.value >= 0 ? "#004699" : "#d9534f"),
            },
          },
          {
            name: "Lopend Totaal",
            type: "line",
            yAxisIndex: 1,
            smooth: true,
            symbol: "none", // Cleaner look for 87 points
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(255, 204, 0, 0.5)" },
                { offset: 1, color: "rgba(255, 204, 0, 0)" },
              ]),
            },
            data: running,
          },
        ],
        toolbox: {
          show: true,
          right: 20,
          feature: {
            dataView: {
              show: true,
              readOnly: true, // Keep it read-only for safety
              title: "Tabelweergave",
              lang: ["Data Tabel", "Sluiten", "Verversen"],
              // This is where you format the "Pop-up" table
              optionToContent: function (opt) {
                const axisData = opt.xAxis[0].data;
                const series = opt.series;
                let table = `
                    <div style="padding:20px; font-family:sans-serif;">
                        <h3 style="color:#004699;">Data Details</h3>
                        <table style="width:100%; border-collapse:collapse; text-align:left;">
                            <thead>
                                <tr style="border-bottom:2px solid #004699; background:#f4f4f4;">
                                    <th style="padding:10px;">Jaar</th>
                                    <th style="padding:10px; text-align:right;">${series[0].name}</th>
                                    <th style="padding:10px; text-align:right;">${series[1].name}</th>
                                </tr>
                            </thead>
                            <tbody>`;

                for (let i = 0; i < axisData.length; i++) {
                  const budget = new Intl.NumberFormat("nl-NL", {
                    style: "currency",
                    currency: "EUR",
                  }).format(series[0].data[i]);
                  const total = new Intl.NumberFormat("nl-NL", {
                    style: "currency",
                    currency: "EUR",
                  }).format(series[1].data[i]);

                  table += `
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:10px;">${axisData[i]}</td>
                            <td style="padding:10px; text-align:right;">${budget}</td>
                            <td style="padding:10px; text-align:right;">${total}</td>
                        </tr>`;
                }
                table += "</tbody></table></div>";
                return table;
              },
            },
            saveAsImage: {
              show: true,
              title: "Downloaden",
              pixelRatio: 2, // High quality for reports
            },
          },
        },
      };

      this.chart.setOption(option);
    }

    // einde class
  }
  return CashflowController;
});

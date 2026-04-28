define([
  "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js?",
  "./CashflowView",
  "./GridView",
  "./DuckDbManager",
  "./DataStore"
], function (echarts, View, Grid, DuckDbManager, store) {
  "use strict";

  class CashflowController {
    constructor() {
      this.engine = new DuckDbManager();
      this.chart = null;
      store.subscribe((state) => this.render(state));
    }

// In draw(oControlHost)
draw(oControlHost) {
    this.container = oControlHost.container;
    this.container.innerHTML = View.template;
    
    const chartDom = this.container.querySelector("#rtm-chart");
    if (chartDom) {
        this.chart = echarts.init(chartDom);
        
        // Listen for zoom/scroll events
        this.chart.on('dataZoom', (params) => {
            const startPercent = params.start !== undefined ? params.start : params.batch[0].start;
            const endPercent = params.end !== undefined ? params.end : params.batch[0].end;
            const totalCount = store.state.results.length;
            
            const startIndex = Math.floor((startPercent / 100) * totalCount);
            const endIndex = Math.ceil((endPercent / 100) * totalCount);
            const filtered = store.state.results.slice(startIndex, endIndex);

            this.updateGrid(filtered);
        });
    }
}

    render(state) {
      if (!this.container) return;
      const statusEl = this.container.querySelector("#rtm-status");
      if (statusEl) statusEl.textContent = "Status: " + state.status;

      if (this.chart && state.results.length > 0) {
        this.updateChart(state.results);
        this.updateGrid(state.results); // Show all initially
      }
    }

    updateGrid(data) {
      const gridEl = this.container.querySelector("#rtm-grid");
      if (gridEl) gridEl.innerHTML = Grid.render(data);
    }

// Inside Main.js updateChart
updateChart(data) {
    const option = {
        animation: true,
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        legend: { data: ['Budget', 'Lopend Totaal'], bottom: 10 },
        // RESTORE ZOOM:
        dataZoom: [
            { type: 'slider', show: true, start: 0, end: 100, bottom: 40 },
            { type: 'inside', start: 0, end: 100 }
        ],
        grid: { top: '10%', left: '5%', right: '5%', bottom: '20%', containLabel: true },
        xAxis: {
            type: 'category',
            data: data.map(d => d.label),
            axisLabel: { color: '#333', fontWeight: 'bold' }
        },
        yAxis: [
            { type: 'value', name: 'Budget (€)', axisLabel: { formatter: '€ {value}' } },
            { type: 'value', name: 'Cumulatief (€)', position: 'right', splitLine: { show: false } }
        ],
        series: [
            {
                name: 'Budget',
                type: 'bar',
                data: data.map(d => d.budget),
                itemStyle: {
                    color: (p) => p.value >= 0 ? '#28a745' : '#dc3545',
                    borderRadius: [4, 4, 0, 0]
                }
            },
            {
                name: 'Lopend Totaal',
                type: 'line',
                yAxisIndex: 1,
                data: data.map(d => d.running),
                smooth: true,
                lineStyle: { width: 4, color: '#004699' },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(0, 70, 153, 0.2)' },
                        { offset: 1, color: 'rgba(0, 70, 153, 0)' }
                    ])
                }
            }
        ]
    };
    this.chart.setOption(option);
    this.chart.resize();
}

    async setData(oControlHost, oData) {
      if (oData.rowCount === 0) return;

      try {
        store.setState({ status: "Engine starten..." });
        await this.engine.init();

        const colNames = oData.columnNames;
        const allRows = [];
        for (let i = 0; i < oData.rowCount; i++) {
          allRows.push(colNames.map((_, j) => oData.getCellValue(i, j)));
        }

        await this.engine.insertData("cashflow", colNames, allRows);

        // FIX: Valid SQL Query
   const sql = `
            SELECT 
                CAST("Jaar" AS VARCHAR) as label, 
                SUM(CAST("Restbudget (okr)" AS DOUBLE)) as budget,
                SUM(CAST("Lopend totaal" AS DOUBLE)) as running
            FROM cashflow 
            GROUP BY "Jaar" 
            ORDER BY "Jaar" ASC
        `;
        const results = await this.engine.query(sql);

        store.setState({
          results: results,
          status: "Systeem Gereed: " + results.length + " jaren gevonden."
        });
      } catch (e) {
        store.setState({ status: "SQL Fout: " + e.message });
      }
    }
  }

  return CashflowController;
});
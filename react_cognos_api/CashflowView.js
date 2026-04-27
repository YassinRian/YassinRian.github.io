define(["jquery"], function($) {
    "use strict";

    return class CashflowView {
        constructor(oControlHost, store, echarts) {
            this.store = store;
            this.echarts = echarts;
            this.$container = $(oControlHost.container);
        }

        render() {
            this.$container.html(`
                <div style="border: 2px solid #004699; background: white; font-family: 'Segoe UI';">
                    <div id="rtm-status" style="padding: 10px; border-bottom: 1px solid #eee;"></div>
                    <div id="rtm-chart" style="width: 100%; height: 450px;"></div>
                </div>
            `);

            const chart = this.echarts.init(document.getElementById("rtm-chart"));

            // Use the global mobx instance
            if (window.mobx) {
                window.mobx.autorun(() => {
                    $("#rtm-status").text("Status: " + this.store.status);
                    
                    if (this.store.results.length > 0) {
                        chart.setOption({
                            xAxis: { type: 'category', data: this.store.results.map(d => d.label) },
                            yAxis: [{ type: 'value' }, { type: 'value', position: 'right' }],
                            series: [
                                { name: 'Budget', type: 'bar', data: this.store.results.map(d => d.total_budget) },
                                { name: 'Totaal', type: 'line', yAxisIndex: 1, data: this.store.results.map(d => d.running_total) }
                            ]
                        });
                    }
                });
            }
        }
    };
});
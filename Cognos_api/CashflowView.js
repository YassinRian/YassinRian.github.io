define(["jquery"], function($) {
    "use strict";

    class CashflowView {
        constructor(oControlHost) {
            this.$container = $(oControlHost.container);
            this.id = oControlHost.id;
            this.chartId = "rtm-chart-" + this.id;
        }

        renderLayout() {
            const style = `
                <style>
                    .rtm-wrapper { border: 2px solid #004699; background: white; font-family: 'Segoe UI', sans-serif; border-radius: 4px; }
                    .rtm-header { background: #004699; color: white; padding: 10px; font-weight: bold; }
                    .rtm-status-bar { padding: 5px 10px; font-size: 11px; color: #666; border-bottom: 1px solid #eee; }
                    .rtm-canvas { width: 100%; height: 450px; }
                </style>
            `;

            const layout = `
                <div class="rtm-wrapper">
                    <div class="rtm-header">Cashflow Analyse - Rotterdam</div>
                    <div id="rtm-status" class="rtm-status-bar">Wachten op data...</div>
                    <div id="${this.chartId}" class="rtm-canvas"></div>
                </div>
            `;

            this.$container.html(style + layout);
        }

        getChartNode() {
            return this.$container.find("#" + this.chartId)[0];
        }

        updateStatus(text) {
            this.$container.find("#rtm-status").text("Status: " + text);
        }
    }
    return CashflowView;
});
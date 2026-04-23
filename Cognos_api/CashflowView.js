define(["jquery"], function($) {
    "use strict";

    class CashflowView {
        constructor(oControlHost) {
            this.$container = $(oControlHost.container);
            this.chartId = "rtm-cashflow-chart-" + oControlHost.id;
        }

        renderLayout() {
            const style = `
                <style>
                    .rtm-dash-wrapper { 
                        border: 3px solid #004699; 
                        background: #fff; 
                        border-radius: 4px; 
                        min-height: 500px;
                    }
                    .rtm-toolbar { 
                        background: #004699; 
                        color: white; 
                        padding: 12px; 
                        font-family: sans-serif;
                    }
                    .rtm-chart-canvas { 
                        width: 100%; 
                        height: 500px; 
                        background: #f9f9f9;
                    }
                    .rtm-status { padding: 10px; color: #666; font-size: 12px; }
                </style>
            `;

            const layout = `
                <div class="rtm-dash-wrapper">
                    <div class="rtm-toolbar">Project Cashflow - Rotterdam</div>
                    <div id="rtm-status-msg" class="rtm-status">Wachten op data...</div>
                    <div id="${this.chartId}" class="rtm-chart-canvas"></div>
                </div>
            `;

            this.$container.html(`
                <h1>HALLOOOOO</h1>
                `);
        }

        getChartNode() {
            // Scoped search inside this container
            return this.$container.find("#" + this.chartId)[0];
        }

        updateStatus(text) {
            this.$container.find("#rtm-status-msg").text(text);
        }
    }
    return CashflowView;
});
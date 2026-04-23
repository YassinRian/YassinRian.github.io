define(["jquery"], function($) {
    "use strict";

    class CashflowView {
        constructor(oControlHost) {
            this.$container = $(oControlHost.container);
            this.chartId = "rtm-cashflow-chart-" + oControlHost.id
        }

        renderLayout() {
            // 1. Create Rotterdam-specific Styles
            const style = `
                <style>
                    .rtm-dash-wrapper { border: 1px solid #004699; background: #fff; border-radius: 4px; overflow: hidden; }
                    .rtm-toolbar { background: #004699; color: white; padding: 12px; display: flex; justify-content: space-between; align-items: center; }
                    .rtm-chart-canvas { width: 100%; height: 500px; padding: 10px; box-sizing: border-box; }
                    .rtm-loading-overlay { font-style: italic; color: #666; font-size: 0.9em; }
                </style>
            `;

            // 2. Build the HTML Layout
            const layout = `
                <div class="rtm-dash-wrapper">
                    <div class="rtm-toolbar">
                        <span>Project Cashflow - Gemeente Rotterdam</span>
                        <div id="filter-anchor"></div>
                    </div>
                    <div id="${this.chartId}" class="rtm-chart-canvas">
                        <span class="rtm-loading-overlay">DuckDB initialiseren...</span>
                    </div>
                </div>
            `;

            // 3. Inject into the Cognos container
            this.$container.empty().append(style).append(layout);
        }

        getChartNode() {
            return this.$container.find("#" + this.chartId)[0];
        }

        updateStatus(text) {
            this.$container.find(".rtm-loading-overlay").text(text);
        }
    };
    return CashflowView;
});

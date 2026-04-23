define(["jquery"], function($) {
    "use strict";

    class CashflowView {
        constructor(oControlHost) {
            this.$container = $(oControlHost.container);
            this.chartId = "rtm-cashflow-chart-" + oControlHost.id;
        }

        renderLayout() {
            this.$container.html(`<h1>HALLOOOOO</h1>`);
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
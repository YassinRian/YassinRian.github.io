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

    }
    return CashflowView;
});
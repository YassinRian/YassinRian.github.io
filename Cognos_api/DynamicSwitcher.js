define(["jquery"], function($) {
    "use strict";

    function DynamicSwitcher() {
        this.oControlHost = null;
        this.targetParam = "p_ShowQuery";
    };

    /**
     * initialize: Setup the references.
     */
    DynamicSwitcher.prototype.initialize = function(oControlHost, oConfig) {
        this.oControlHost = oControlHost;
        if (oConfig && oConfig.parameterName) {
            this.targetParam = oConfig.parameterName;
        }
    };

    /**
     * draw: The actual rendering engine.
     * This is where we kill the spinner by calling the callback.
     */
    DynamicSwitcher.prototype.draw = function(oControlHost) {
        var $container = $(oControlHost.container);
        $container.empty();

        var $menu = $('<div class="tab-wrapper" style="display:flex; gap:10px;"></div>');
        var queries = [
            { id: 1, label: "Revenue Detail" },
            { id: 2, label: "Inventory Status" },
            { id: 3, label: "HR Headcount" },
            { id: 4, label: "Regional Expenses" },
            { id: 5, label: "Audit Logs" }
        ];

        queries.forEach(function(q) {
            $('<button>', {
                text: q.label,
                style: "padding: 10px 20px; cursor: pointer; border: 1px solid #ccc; background: #f9f9f9;",
                click: function() { this.handleNavigation(q.id); }.bind(this)
            }).appendTo($menu);
        }.bind(this));

        $container.append($menu);

        /**
         * The "Spinner Killer": Find the callback in the draw arguments.
         * Calling this tells Cognos the UI is ready.
         */
        var fnDone = Array.prototype.find.call(arguments, function(arg) {
            return typeof arg === 'function';
        });

        if (fnDone) {
            fnDone();
        }
    };

    DynamicSwitcher.prototype.handleNavigation = function(targetID) {
        var oPage = this.oControlHost.page;

        // Correct array access for Prompt API
        var userSelection = oPage.getControlByName("p_UserRole").getValues();
        var userRole = (userSelection && userSelection.length > 0) ? userSelection[0].use : "";

        if (targetID === 5 && userRole !== 'Admin') {
            alert("Access Denied: Only Admins can load the Audit Query.");
            return;
        }

        var ctrl = oPage.getControlByName(this.targetParam);
        if (ctrl) {
            ctrl.setValues([{ "use": targetID.toString() }]);
            // Triggers the conditional block update
            this.oControlHost.valueChanged();
        }
    };

    return DynamicSwitcher;
});

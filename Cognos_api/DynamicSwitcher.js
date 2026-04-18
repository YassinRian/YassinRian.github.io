define(["jquery"], function($) {
    "use strict";

    class DynamicSwitcher {
        constructor() {
            this.oControlHost = null;
            this.config = null;
            this.targetParam = "p_ShowQuery"; // Default parameter name
        }

        /**
         * initialize: Setup the control and signal completion to hide the spinner.
         */
        initialize(oControlHost, oConfig) {
            this.oControlHost = oControlHost;
            this.config = oConfig;

            if (oConfig && oConfig.parameterName) {
                this.targetParam = oConfig.parameterName;
            }

            // Draw the buttons immediately
            this.render(oControlHost);

            /**
             * THE FIX: Find the 'fnDoneInitializing' callback wherever it is in the stack.
             * This prevents the "is not a function" error and clears the initial spinner.
             */
            const fnDone = Array.from(arguments).find(arg => typeof arg === 'function');
            if (fnDone) {
                fnDone();
            } else {
                console.warn("fnDoneInitializing was not provided by Cognos.");
            }
        }

        /**
         * render: Builds the button interface.
         */
        render(oControlHost) {
            const $container = $(oControlHost.container);
            $container.empty();

            const $menu = $('<div class="tab-wrapper" style="display:flex; gap:10px; flex-wrap: wrap;"></div>');

            const queries = [
                { id: 1, label: "Revenue Detail" },
                { id: 2, label: "Inventory Status" },
                { id: 3, label: "HR Headcount" },
                { id: 4, label: "Regional Expenses" },
                { id: 5, label: "Audit Logs" }
            ];

            queries.forEach(q => {
                $('<button>', {
                    text: q.label,
                    style: "padding: 10px 20px; cursor: pointer; border: 1px solid #ccc; background: #f9f9f9; border-radius: 4px;",
                    click: () => this.handleNavigation(q.id)
                }).appendTo($menu);
            });

            $container.append($menu);
        }

        /**
         * handleNavigation: Logic for switching queries.
         */
        handleNavigation(targetID) {
            const oPage = this.m_oControlHost ? this.m_oControlHost.page : this.oControlHost.page;

            // Correctly access the User Role from the Prompt API array
            const userSelection = oPage.getControlByName("p_UserRole").getValues();
            const userRole = (userSelection && userSelection.length > 0) ? userSelection[0].use : "";

            if (targetID === 5 && userRole !== 'Admin') {
                alert("Access Denied: Only Admins can load the Audit Query.");
                return;
            }

            const ctrl = oPage.getControlByName(this.targetParam);
            if (ctrl) {
                ctrl.setValues([{ "use": targetID.toString() }]);

                /**
                 * Triggers the refresh. If the network blocks the 'Success' signal,
                 * the spinner may stay up until a timeout occurs.
                 */
                this.oControlHost.valueChanged();
            }
        }

        /**
         * setData: Required in Interactive Mode to release the spinner after a refresh.
         */
        setData(oControlHost, oData) {
            const fnDoneRunning = Array.from(arguments).find(arg => typeof arg === 'function');
            if (fnDoneRunning) {
                fnDoneRunning();
            }
        }

        destroy(oControlHost) {
            $(oControlHost.container).empty();
        }
    }

    return DynamicSwitcher;
});

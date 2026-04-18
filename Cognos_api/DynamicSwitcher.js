define(["jquery"], function($) {
        "use strict";

        class DynamicSwitcher {

                constructor() {
                        this.oControlHost = null;
                        this.config = null;
                        this.targetParam = "p_ShowQuery"; // default parameter name
                }


                initialize(oControlHost, oConfig, fnDoneInitializing) {
                        this.oControlHost = oControlHost;
                        this.config = oConfig;

                        if (oConfig && oConfig.parameterName) {
                                this.targetParam = oConfig.parameterName;
                        }

                        // Draw your buttons
                        this.render(oControlHost);

                        /**
                         * Safety Check: Only call if it exists.
                         * If fnDoneInitializing is missing, Cognos is likely
                         * not waiting for a signal for this specific control.
                         */
                        if (typeof fnDoneInitializing === "function") {
                                fnDoneInitializing();
                        } else {
                                console.warn("fnDoneInitializing was not provided by Cognos.");
                        }
                }

                // render: Builds the interface.
                // Instead of just buttons, we can check current report data here.
                render(oControlHost) {
                        const $container = $(oControlHost.container);
                        $container.empty();
                        // Example: A wrapper for our dynamic "tabs"
                        const $menu = $('<div class="tab-wrapper" style="display:flex; gap:10px;"></div>');

                        // our dynamic targets
                        const queries = [
                                { id: 1, label: "Revenue Detail" },
                                { id: 2, label: "Inventory Status" },
                                { id: 3, label: "HR Headcount" },
                                { id: 4, label: "Regional Expenses" },
                                { id: 5, label: "Audit Logs" }
                        ];

                        queries.forEach(q => {
                                const $btn = $('<button>', {
                                        text: q.label,
                                        style: "padding: 10px 20px; cursor: pointer; border: 1px solid #ccc; background: #f9f9f9;",
                                        click: () => this.handleNavigation(q.id)
                                });
                                $menu.append($btn);
                        });

                        $container.append($menu);

                }


                handleNavigation(targetID) {
                        const oPage = this.oControlHost.page;

                        // 1. Correct the User Role check
                        // getValues() returns an array; we need to check the first element.
                        const userSelection = oPage.getControlByName("p_UserRole").getValues();
                        const userRole = (userSelection && userSelection.length > 0) ? userSelection[0].use : "";

                        if (targetID === 5 && userRole !== 'Admin') {
                                alert("Access Denied: Only Admins can load the audit Query.");
                                return; // Stop execution if unauthorized
                        }

                        // 2. Set the target parameter
                        const targetCtrl = oPage.getControlByName(this.targetParam);
                        if (targetCtrl) {
                                targetCtrl.setValues([{ "use": targetID.toString() }]);

                                // 3. The "Breezy" Update: Use reprompt() instead of valueChanged()
                                // oPage.reprompt() often bypasses the blocked 'Working...' heartbeat
                                // while still forcing the Conditional Blocks to update.
                                oPage.finish();
                        }
                }


                destroy(oControlHost) {
                        $(oControlHost.container).empty();
                }
                // einde class
        }

        return DynamicSwitcher
});

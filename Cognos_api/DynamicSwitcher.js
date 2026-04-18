define(["jquery"], function($) {
        "use strict";

        class DynamicSwitcher {

                constructor() {
                        this.oControlHost = null;
                        this.config = null;
                        this.targetParam = "p_ShowQuery"; // default parameter name
                }


                // initialize: Called by Cognos when the control is first loaded.
                initialize(oControlHost, oConfig) {
                        this.oControlHost = oControlHost;
                        this.config = oConfig;
                        if (oConfig && oConfig.parameterName) {
                                this.targetParam = oConfig.parameterName;
                        }
                        this.render(oControlHost);
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

                        const userSelection = oPage.getControlByName("p_UserRole").getValues();

                        if (targetID === 5 && userSelection.use !== 'Admin') {
                                alert("Access Denied: Only Admins can load the audit Query.");
                        }

                        oPage.getControlByName(this.targetParam).setValues([{ "use": targetID }]);
                        this.oControlHost.valueChanged();

                }


                destroy(oControlHost) {
                        $(oControlHost.container).empty();
                }
                // einde class
        }

        return DynamicSwitcher
});

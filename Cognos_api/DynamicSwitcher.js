define(["jquery"], function($) {
        "use strict";

        class DynamicSwitcher {
                constructor() {
                        this.oControlHost = null;
                        this.targetParam = "p_ShowQuery";
                        this.queries = [
                                { id: 1, label: "Revenue Detail" },
                                { id: 2, label: "Inventory Status" },
                                { id: 3, label: "HR Headcount" },
                                { id: 4, label: "Regional Expenses" },
                                { id: 5, label: "Audit Logs" }
                        ];
                }

                /**
                 * Similar to your App.js draw method
                 */
                draw(oControlHost) {
                        this.oControlHost = oControlHost;
                        const $container = $(oControlHost.container);

                        // Initial Render
                        this.renderUI($container);

                        // Event Listeners (Using your delegation style)
                        $container.on("click", ".nav-btn", (e) => {
                                const id = $(e.currentTarget).data("id");
                                this.handleNavigation(id);
                        });

                        /**
                         * RELEASE THE SPINNER
                         * Since your environment might skip fnDoneInitializing,
                         * we grab the callback from the draw arguments directly.
                         */
                        const fnDone = Array.from(arguments).find(arg => typeof arg === 'function');
                        if (fnDone) fnDone();
                }

                renderUI($container) {
                        $container.empty();
                        const $wrapper = $('<div class="switcher-wrapper" style="display:flex; gap:10px;"></div>');

                        this.queries.forEach(q => {
                                $('<button>', {
                                        text: q.label,
                                        class: "nav-btn",
                                        "data-id": q.id,
                                        style: "padding: 10px 20px; cursor: pointer; border: 1px solid #ccc; background: #f9f9f9; border-radius: 4px;"
                                }).appendTo($wrapper);
                        });

                        $container.append($wrapper);
                }

                handleNavigation(targetID) {
                        const oPage = this.oControlHost.page;

                        // User Role logic check (mirroring your App.js filter style)
                        const userSelection = oPage.getControlByName("p_UserRole").getValues();
                        const userRole = (userSelection && userSelection.length > 0) ? userSelection[0].use : "";

                        if (targetID === 5 && userRole !== 'Admin') {
                                alert("Access Denied: Only Admins can load the Audit Query.");
                                return;
                        }

                        const ctrl = oPage.getControlByName(this.targetParam);
                        if (ctrl) {
                                ctrl.setValues([{ "use": targetID.toString() }]);
                                // Refresh the report state
                                this.oControlHost.valueChanged();
                        }
                }
        }

        return DynamicSwitcher;
});

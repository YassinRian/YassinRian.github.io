define(["jquery"], function($) {
        "use strict";

        class DynamicSwitcher {
                constructor() {
                        this.oControlHost = null;
                        this.baseUrl = "https://cognos.ontw.rotterdam.local/ibmcognos/bi/?pathRef=";
                        this.embedParams = "&ui_appbar=false&ui_navbar=false&shareMode=embedded";

                        // Example paths from your 'Share' link
                        this.queries = [
                                {
                                        id: 1,
                                        label: "Revenue Detail",
                                        path: ".public_folders%2F1.%2BBCO%2F1.1%2BFJINK%2F1.1.13%2BGrex%2FPRJGX_310%2BFinancieel%2Boverzicht%2BGREX%2B%2528FOG%2529%2Bvele%2Bselectiemogelijkheden"
                                },
                                {
                                        id: 2,
                                        label: "Inventory Status",
                                        path: ".public_folders%2F1.%2BBBC0%2F1.1%2BFJINK%2FReportB"
                                },
                                {
                                        id: 5,
                                        label: "Audit Logs (Admin)",
                                        path: ".public_folders%2F1.%2BBBC0%2F1.1%2BFJINK%2FAuditReport"
                                }
                        ];
                }

                draw(oControlHost) {
                        this.oControlHost = oControlHost;
                        const $container = $(oControlHost.container);

                        this.renderUI($container);

                        // Event Delegation for the buttons
                        $container.on("click", ".nav-btn", (e) => {
                                const id = $(e.currentTarget).data("id");
                                this.handleNavigation(id);
                        });

                        // Standard Cognos 11 Spinner Release
                        const fnDone = Array.from(arguments).find(arg => typeof arg === 'function');
                        if (fnDone) fnDone();
                }

                renderUI($container) {
                        $container.empty();

                        // 1. Navigation Menu
                        const $menu = $('<div class="switcher-menu" style="display:flex; gap:10px; margin-bottom:15px;"></div>');
                        this.queries.forEach(q => {
                                $('<button>', {
                                        text: q.label,
                                        class: "nav-btn",
                                        "data-id": q.id,
                                        style: "padding: 10px 20px; cursor: pointer; border: 1px solid #ccc; background: #f9f9f9; border-radius: 4px;"
                                }).appendTo($menu);
                        });

                        // 2. The Viewport (Iframe) where external reports will load
                        const $viewport = $('<iframe>', {
                                id: "dashboard-viewport",
                                style: "width:100%; height:800px; border:1px solid #eee;",
                                src: "about:blank" // Starts empty
                        });

                        $container.append($menu).append($viewport);
                }

                handleNavigation(targetID) {
                        const oPage = this.oControlHost.page;

                        // User Role Security Check
                        const roleCtrl = oPage.getControlByName("p_UserRole");
                        if (roleCtrl) {
                                const userSelection = roleCtrl.getValues();
                                const userRole = (userSelection && userSelection.length > 0) ? userSelection[0].use : "";

                                if (targetID === 5 && userRole !== 'Admin') {
                                        alert("Access Denied: Only Admins can load the Audit Query.");
                                        return;
                                }
                        }

                        // Find report path and update iframe
                        const report = this.queries.find(q => q.id === targetID);
                        if (report) {
                                const finalUrl = this.baseUrl + report.path + this.embedParams;
                                $(this.oControlHost.container).find("#dashboard-viewport").attr("src", finalUrl);

                                // Note: Since we are using an iframe, we don't need reprompt()
                                // to update the internal report state anymore!
                        }
                }
        }

        return DynamicSwitcher;
});

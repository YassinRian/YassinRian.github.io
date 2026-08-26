
define([], function () {
    "use strict";

    class SetSearchOption {
        constructor() {}

        draw(oControlHost) {
            const oConfig = oControlHost.configuration || {};
            const optionIndex = (oConfig.searchOptionIndex !== undefined) ? oConfig.searchOptionIndex : 2;

            const applySelection = () => {
                // Zoek alle <select> elementen in het document
                const allSelects = Array.from(document.querySelectorAll("select"));

                // Zoek exact de dropdown die de "Start met..." optie bevat
                const searchOptionSelect = allSelects.find(select => {
                    if (select.multiple || select.options.length < 3) return false;
                    const firstOpt = select.options[0]?.text || "";
                    return firstOpt.includes("Start met") || firstOpt.includes("Starts with");
                });

                if (searchOptionSelect) {
                    searchOptionSelect.selectedIndex = optionIndex;
                    
                    // Trigger events zodat Cognos de status update
                    searchOptionSelect.dispatchEvent(new Event("change", { bubbles: true }));
                    searchOptionSelect.dispatchEvent(new Event("input", { bubbles: true }));

                    if (typeof searchOptionSelect.onchange === "function") {
                        searchOptionSelect.onchange();
                    }
                    return true;
                }
                return false;
            };

            // 1. Probeer direct uit te voeren
            if (applySelection()) return;

            // 2. Als de UI nog bezig is met opbouwen, wacht via MutationObserver
            const observer = new MutationObserver((mutations, obs) => {
                if (applySelection()) {
                    obs.disconnect(); // Stop observer direct zodra hij is ingesteld
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    return SetSearchOption;
});
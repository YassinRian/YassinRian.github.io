define([], function () {
    "use strict";

    class SetSearchOption {
        constructor() {}

        draw(oControlHost) {
            const oConfig = oControlHost.configuration;

            if (!oConfig || !oConfig.targetPrompt) {
                console.warn("SetSearchOption: Geen 'targetPrompt' opgegeven in JSON.");
                return;
            }

            const targetPromptName = oConfig.targetPrompt;
            const optionIndex = (oConfig.searchOptionIndex !== undefined) ? oConfig.searchOptionIndex : 2;

            const promptControl = oControlHost.page.getControlByName(targetPromptName);
            if (!promptControl) {
                console.warn(`SetSearchOption: Prompt '${targetPromptName}' niet gevonden.`);
                return;
            }

            const applySelection = (selectElem) => {
                // Controleer of de optie nog niet goed staat
                if (selectElem.selectedIndex !== optionIndex) {
                    selectElem.selectedIndex = optionIndex;

                    // Trigger alle relevant browser events voor Cognos UI bindings
                    selectElem.dispatchEvent(new Event("change", { bubbles: true }));
                    selectElem.dispatchEvent(new Event("input", { bubbles: true }));

                    if (typeof selectElem.onchange === "function") {
                        selectElem.onchange();
                    }
                }
            };

            // Observeren tot Cognos de opties in de dropdown heeft geschreven
            const observer = new MutationObserver(() => {
                const container = promptControl.element;
                if (!container) return;

                const selectElements = Array.from(container.querySelectorAll("select"));
                // Pak de enkele dropdown (en niet de multi-select resultatenlijsten)
                const searchOptionSelect = selectElements.find(el => !el.multiple);

                if (searchOptionSelect && searchOptionSelect.options.length > optionIndex) {
                    observer.disconnect(); // Stop met observeren

                    // Laat Cognos eerst zijn eigen default-scripts afronden, pas daarna aan
                    setTimeout(() => {
                        applySelection(searchOptionSelect);
                    }, 250);
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
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

            // Hulpfunctie om de optie direct in te stellen
            const applyOption = (container) => {
                const selectElements = Array.from(container.querySelectorAll("select"));
                const searchOptionSelect = selectElements.find(el => !el.multiple && el.options.length > 0);

                if (searchOptionSelect && searchOptionSelect.options.length > optionIndex) {
                    searchOptionSelect.selectedIndex = optionIndex;
                    searchOptionSelect.dispatchEvent(new Event("change", { bubbles: true }));
                    
                    if (typeof searchOptionSelect.onchange === "function") {
                        searchOptionSelect.onchange();
                    }
                    return true;
                }
                return false;
            };

            const container = promptControl.element;

            // 1. Probeer direct (als de DOM al klaar is)
            if (container && applyOption(container)) {
                return;
            }

            // 2. Zo niet: luister via MutationObserver naar DOM-updates (zonder timers)
            const observer = new MutationObserver((mutations, obs) => {
                const currentContainer = promptControl.element;
                if (currentContainer && applyOption(currentContainer)) {
                    obs.disconnect(); // Stop direct met observeren zodra de optie is gezet
                }
            });

            observer.observe(container || document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    return SetSearchOption;
});
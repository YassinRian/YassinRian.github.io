
define([], function () {
    "use strict";

    class SetSearchOption {
        constructor() {
            // Eventuele initialisatie kan hier plaatsvinden
        }

        draw(oControlHost) {
            const oConfig = oControlHost.configuration;

            // Validatie van de JSON configuratie
            if (!oConfig || !oConfig.targetPrompt) {
                console.warn("SetSearchOption: Geen 'targetPrompt' opgegeven in JSON.");
                return;
            }

            const targetPromptName = oConfig.targetPrompt;
            const optionIndex = (oConfig.searchOptionIndex !== undefined) ? oConfig.searchOptionIndex : 2;

            // Haal de Cognos prompt control op
            const promptControl = oControlHost.page.getControlByName(targetPromptName);
            if (!promptControl) {
                console.warn(`SetSearchOption: Prompt '${targetPromptName}' niet gevonden.`);
                return;
            }

            // Arrow function behoudt de lexical scope van 'this'
            setTimeout(() => {
                const container = promptControl.element;
                if (!container) return;

                const selectElem = container.querySelector("select");

                if (selectElem && selectElem.options.length > optionIndex) {
                    selectElem.selectedIndex = optionIndex;

                    // Trigger het change-event zodat Cognos de wijziging registreert
                    const event = document.createEvent("HTMLEvents");
                    event.initEvent("change", true, true);
                    selectElem.dispatchEvent(event);
                }
            }, 300);
        }
    }

    // Exporteer de klasse direct naar Cognos
    return SetSearchOption;
});
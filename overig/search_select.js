define([], function () {
    "use strict";

    class SetSearchOption {
        draw(oControlHost) {
            const oConfig = oControlHost.configuration || {};
            const optionIndex = (oConfig.searchOptionIndex !== undefined) ? oConfig.searchOptionIndex : 2;

            // Start een checker die elke 200 milliseconden kijkt
            const poller = setInterval(() => {
                
                // Zoek alle <select> elementen
                const allSelects = Array.from(document.querySelectorAll("select"));
                
                // Zoek specifiek naar de dropdown met de 4 Cognos-zoekopties
                const searchDropdown = allSelects.find(s => !s.multiple && s.options.length === 4);

                if (searchDropdown) {
                    // Check of hij nog op de verkeerde optie staat
                    if (searchDropdown.selectedIndex !== optionIndex) {
                        searchDropdown.selectedIndex = optionIndex;
                        
                        // Vuur events af (Dojo luistert vaak naar muis-events i.p.v. change)
                        searchDropdown.dispatchEvent(new Event("change", { bubbles: true }));
                        searchDropdown.dispatchEvent(new Event("input", { bubbles: true }));
                        searchDropdown.dispatchEvent(new MouseEvent("click", { bubbles: true }));
                    } else {
                        // Hij staat nu succesvol op de juiste optie! Stop het script.
                        clearInterval(poller);
                    }
                }
            }, 200);

            // Veiligheid: Stop het script sowieso na 5 seconden om oneindige loops te voorkomen
            setTimeout(() => clearInterval(poller), 5000);
        }
    }

    return SetSearchOption;
});
define([], function() {}
 "use strict";

 function CustomSearchOption() {};

 CustomSearchOption.prototype.draw = function(oControlHost) {
	var oConfig = oControlHost.configuration;

	if(!oConfig || !oConfig.targetPrompt) {
		console.error("CustomControl Error: 'targetPrompt' is niet gedefinieerd in de JSON configuratie");
		return;
	}

	var targetPromptName = oConfig.targetPrompt;
	// Default optie index: 0 = Start met.., 1 = Start met het 1ste trefwoord.., 2 = Bevat een van deze trefwoorden, 3 = Bevat alle trefwoorden

	var optionIndex = (oConfig.searchOptionIndex !== undefined) ? oConfig.searchOptionIndex: 2;

	// Haal het Cognos prompt control object op
	var promptControl = oControlHost.page.getControlByName(targetPromptName);

	if(!promptControl) {
		console.error("CustomControl Error: Prompt met naam" + targetPromptName + "niet gevonden.");
		return;
	}

	setTimeout(function() {
		var container = promptControl.element;
		if(!container) return;

		// Zoek het uitklapmenu van de zoekopties(select element)
		var selectElem = container.querySelector("select")

		if(selectElem && selectElem.options.length > optionIndex) {
			selectElem.selectedIndex = optionIndex;

			// Voer event uit zodat Cognos de gewijzigde selectie herkent
			var event = document.createEvent("HTMLEvents");
			event.initEvent("change", true, true);
			selectElem.dispatchEvent(event);
		}
	}, 150);
}
);

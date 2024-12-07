define(function () {
	"use strict";

	function BasicControl() {}

	BasicControl.prototype.draw = function (oControlHost) {
		const cont = oControlHost.container;
		cont.innerHTML =
			"<h1>nou met het wissen van de cache kan het werken!!</h1>";
	};
	return BasicControl;
});

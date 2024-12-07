define(function () {
	"use strict";

	function BasicControl() {}

	BasicControl.prototype.draw = function (oControlHost) {
		const cont = oControlHost.container;
		cont.innerHTML = "<h1>nou nog een keer dan maar!!</h1>";
	};
	return BasicControl;
});

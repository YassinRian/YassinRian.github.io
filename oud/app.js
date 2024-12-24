define(function () {
	"use strict";

	function BasicControl() {}

	BasicControl.prototype.draw = function (oControlHost) {
		const cont = oControlHost.container;
		cont.innerHTML = "<h1>zo kan je toch niet werken !!</h1>";
	};
	return BasicControl;
});
define(function () {
    "use strict";

    function BasicControl() { };

    BasicControl.prototype.draw = function(oControlHost) {
        const cont = oControlHost.container;
        cont.innerHTML = "<h1>even kijken ..mijn emacs werkt in elk geval!!</h1>"
    };
    return BasicControl;
});
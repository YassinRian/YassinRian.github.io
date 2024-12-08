define(function () {
    "use strict";

    function BasicControl() { };

    BasicControl.prototype.draw = function(oControlHost) {
        const cont = oControlHost.container;
        cont.innerHTML = "<h1>nou weer terug bij af</h1>"
    };
    return BasicControl;
});
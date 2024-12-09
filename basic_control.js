define(function () {
    "use strict";

    function BasicControl() { };

    BasicControl.prototype.draw = function(oControlHost) {
        const cont = oControlHost.container;
        cont.innerHTML = "<h1>Yassin en Martin aan het rommelen met JS</h1>"
    };
    return BasicControl;
});
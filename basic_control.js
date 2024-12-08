define(function () {
    "use strict";

    function BasicControl() { };

    BasicControl.prototype.draw = function(oControlHost) {
        const cont = oControlHost.container;
        cont.innerHTML = "<h1>dit werkt natuurlijk beter</h1>"
        alert("hallo")
    };
    return BasicControl;
});
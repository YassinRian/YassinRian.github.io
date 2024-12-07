define(function () {
    "use strict";

    function BasicControl() { };

    BasicControl.prototype.draw = function(oControlHost) {
        const cont = oControlHost.container;
        cont.innerHTML = "<h1>hallo op deze mooie zaterdag en ik ben aan het rommelen met Github!!</h1>"
    };
    return BasicControl;
});
define(function () {
    "use strict";

    function BasicControl() { };

    BasicControl.prototype.initialize = function(oControlHost) {
        let { parameter } = oControlHost.configuration;
        console.log({parameter})
        console.log(oControlHost)
        console.log(oControlHost.xmlElement)
        
    };
    return BasicControl;
});
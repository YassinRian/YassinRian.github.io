define(function () {
    "use strict";

    function BasicControl() { };

    BasicControl.prototype.initialize = function(oControlHost) {
        let { parameter } = oControlHost.configuration;
        console.log(oControlHost.configuration)
        console.log(oControlHost)
        console.log(oControlHost.prototype.getParameter("p_artikel_beschrijving"))
        //console.log(oControlHost.xmlElement)
        
    };
    return BasicControl;
});
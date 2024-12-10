define(function () {
    "use strict";

    function BasicControl() { };

    BasicControl.prototype.initialize = function(oControlHost) {
        let { parameter } = oControlHost.configuration;
        console.log(oControlHost.configuration)
        console.log(oControlHost)

        let someObject = {
            _05d: function() {
                return "some value";
            },
            _i1m: function() {
                return "123";
            }
        }
        let obj_yas = new _b51(someObject);
        let uniqueId = obj_yas.generateUniqueID();
        console.log(uniqueId);
        // console.log(oControlHost.prototype.getParameter())
        //console.log(oControlHost.xmlElement)
        
    };
    return BasicControl;
});
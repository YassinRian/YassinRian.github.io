define(function () {
    "use strict";

    function BasicControl() { };

    BasicControl.prototype.initialize = function(oControlHost) {
        let { parameter } = oControlHost.configuration;
        console.log(oControlHost.configuration)
        console.log(oControlHost)
        // hier heb ik een instance van _b51 met een eigen object waarden die ik meegeef :)
        // _b51 is oControlHost (eigenlijk de instance van _b51)
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
        let parameter_ = obj_yas.getParameter("p_artikel_beschrijving")
        console.log(uniqueId);
        console.log(parameter_);
        // console.log(oControlHost.prototype.getParameter())
        //console.log(oControlHost.xmlElement)
        
    };







    return BasicControl;
});
define(function() {
    "use strict"

    function BasicControl() {}; // constructor obj

BasicControl.prototype.initialize = function(oControlHost) {
    this.oControlHost = oControlHost;
    return this;
}

    let someObject = {
        _05d: function() {
            return "Some value";
        },
        _i1m: function() {
            return "123";
        }
    }

let controlHost = new _b51(someObject);
let instantiated_obj = new BasicControl().initialize(controlHost);
console.log(instantiated_obj.oControlHost.getParameter("p_artikel_beschrijving"));

});
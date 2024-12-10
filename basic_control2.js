define(function() {
    "use strict"

    function BasicControl() {}; // constructor obj

    let someObject = {
        _05d: function() {
            return "Some value";
        },
        _i1m: function() {
            return "123";
        }
    }

let basicControl = new BasicControl();
let controlHost = new _b51(someObject);
let parameter = basicControl.prototype.initialize(controlHost).getParameter("p_artikel_omschrijving");
let uniqueId = basicControl.prototype.initialize(controlHost).generateUniqueID();
console.log(parameter);
console.log(uniqueId);

});
define(function() {
    "use strict"

    function BasicControl() {}; // constructor obj

//     let someObject = {
//         _05d: function() {
//             return "Some value";
//         },
//         _i1m: function() {
//             return "123";
//         }
//     }

// let controlHost = new _b51(someObject);

BasicControl.prototype.initialize = function(oControlHost) {
    this.oControlHost = oControlHost;
    return this;
}

let instantiated_obj = new BasicControl();
console.log(instantiated_obj.getParameter("p_artikel_beschrijving"));

});
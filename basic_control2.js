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
    
console.log(oControlHost.getParameter("p_artikel_beschrijving"));
}

});
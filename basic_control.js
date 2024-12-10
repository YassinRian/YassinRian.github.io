define(function () {
    "use strict";

    function BasicControl() { };

    BasicControl.prototype.initialize = function() {
        console.log("hallo Yassin")
        console.log(oPage.application)
        
    };
    return BasicControl;
});
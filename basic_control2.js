define(function () {
    "use strict"

    function BasicControl() { };

    BasicControl.prototype.draw = function(oControlHost){
        console.log(oControlHost.getParameter("p_artikel_beschrijving"));
    }

    return BasicControl;
})
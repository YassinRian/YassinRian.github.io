define(['jquery'], function ($) {

    "use strict";

    function BasicControl () { };

    BasicControl.prototype.draw = function(oControlHost) {
      let elm = oControlHost.container;
      $(elm).append("<h1>Hallo Yassin</h1>")

    }

    return BasicControl;
  
});

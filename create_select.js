define(['jquery'], function ($) {

    "use strict";

    function BasicControl () { };

    BasicControl.prototype.draw = function(oControlHost) {
      let elm = oControlHost.container;
      $(elm).append("<h1>Hallo Yassin Rian!</h1>")
      console.log(oControlHost.xmlElement.textContent)

    }

    return BasicControl;
  
});

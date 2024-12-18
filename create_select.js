define(['jquery'], function ($) {

    "use strict";

    function BasicControl () { };

    BasicControl.prototype.draw = function(oPage) {
      //let elm = oControlHost.container;
      //$(elm).append("<h1>Hallo Yassin Rian!</h1>")
      console.log(oPage.page.application.document.reportXML);
    }

    return BasicControl;
  
});

define(['jquery', 'https://yassinrian.github.io/extractie_func.js'], function ($, xml_funcs) {

    "use strict";

    function BasicControl () { };

    BasicControl.prototype.initialize = function(oPage, fnDoneInitializing){
      this.xml_data = oPage.page.application.document.reportXML;
      fnDoneInitializing();
    }

    BasicControl.prototype.draw = function(oControlHost) {
      let elm = oControlHost.container;
      $(elm).append("<button id='yassin_button'>Haal Velden op</button>");
      $(elm).append("<div id='result'></div>")

      $('#yassin_button').on('click', function(){
        xml_funcs.verwerken(this.xml_data);
      })
      
    }

    return BasicControl;
  
});

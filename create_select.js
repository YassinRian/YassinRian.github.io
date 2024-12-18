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
      $(elm).append("<div class='result'></div>")

      $('#yassin_button').on('click', function(){
        xml_funcs.verwerken(this.xml_data);

        // parse the xml string into an XML DOM object
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "application/xml");

        // Get all the dataItem elements
        const dataItems = xmlDoc.querySelector('dataItem');

        // Initialize an array to hold CSV rows
        let csvRows = ['name, expression']; // Adding header row

        // Iterate over each dataItem element
        dataItems.forEach(dataItem => {
          // Extract the name attribute and the expression text
          const name = dataItem.getAttribute('name');
          const expression = dataItem.querySelector('expression').textContent;
        });

      })


      
    }

    return BasicControl;
  
});

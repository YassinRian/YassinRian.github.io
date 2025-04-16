define([
  "jquery"
], function ($, html_func_) {
  "use strict";

  class App {
    constructor() {}


    draw(yassinsControl) {
      let oControl = yassinsControl.page.getControlByName("prmt_clusters").element;
      let selectElement = oControl.querySelector("select");
      if (selectElement && selectElement.options.length >=2) {
        selectElement.remove(0);
        selectElement.remove(0);
      }
    }

  }

  return App;
});

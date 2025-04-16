define([
  "jquery"
], function ($, html_func_) {
  "use strict";

  class App {
    constructor() {}

    initialize( oControlHost, fnDoneInitializing )
    {
      let oControl = oControlHost.page.getControlByName("prmt_clusters").element;
      let selectElement = oControl.querySelector("select");
      if (selectElement && selectElement.options.length >=2) {
        selectElement.remove(0);
        selectElement.remove(0);
      }

	    fnDoneInitializing();
    }

  }

  return App;
});

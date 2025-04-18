define([
  "jquery"
], function ($) {
  "use strict";

  class App {
    constructor() {
      this.promptElement = null;
      this.container = null;
    }

    initialize(oControlHost, fnDoneInitializing) {
      const control = oControlHost.page.getControlByName("prmt_clusters");
      console.log(oControlHost)
      if (control && control.element) {
        if (control.element.tagName === 'SELECT') {
          this.promptElement = control.element;
        } else {
          this.promptElement = control.element.querySelector('select');
        }
      }
      this.container = oControlHost.container;
      fnDoneInitializing();
    }


    draw(oControlHost) {

      console.log(oControlHost.page.application.rsLaunchParameters.GetTemplate());

    }

  }

  return App;
});
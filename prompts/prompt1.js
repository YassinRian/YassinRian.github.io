define([
  "jquery",
  "https://yassinrian.netlify.app/prompts/html_func.js",
], function ($, html_func_) {
  "use strict";

  class App {
    constructor() {}

    setData(store) {
      let func_ = store.page.application.rsLaunchParameters
      console.log(func_.GetTemplate());
    }

    draw(oControlHost) {
      let elm = oControlHost.container;
      $(elm).append(`<h1>Yassin Rian</h1>`);
      let oControl = oControlHost.page.getControlByName("prmt_clusters").element;
      let selectElement = oControl.querySelector("select");
      if (selectElement && selectElement.options.length >=2) {
        selectElement.remove(0);
        selectElement.remove(0);    
      }
    }

  }

  return App;
});

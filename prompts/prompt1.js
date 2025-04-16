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
      let oControl = oControlHost.page.getControlByName("prmt_clusters");
      let selectElement = oControl.getElement(); 
      let selectId = selectElement.getAttribute("id");
      console.log(selectId);
      console.log(selectElement);
      console.log(selectElement.options);
      console.log(selectElement.options[0].value);
      console.log(selectElement.options[1].value);
      console.log(selectElement.options[2].value);
      console.log(selectElement.options[3].value);
    }

  }

  return App;
});

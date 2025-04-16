define([
  "jquery",
  "https://yassinrian.netlify.app/prompts/html_func.js",
], function ($, html_func_) {
  "use strict";

  class App {
    constructor() {}

    setData(store) {
      console.log(store);
    }

    draw(oControlHost) {
      let elm = oControlHost.container;
      $(elm).append(`<h1>Yassin Rian</h1>`);
      let oControl = oControlHost.page.getControlByName("prmt_clusters");
      console.log(oControl);
    }

  }

  return App;
});

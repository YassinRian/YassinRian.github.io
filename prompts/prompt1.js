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
      console.log(oControl);
    }

  }

  return App;
});

define([
  "jquery",
  "https://yassinrian.netlify.app/prompts/html_func.js",
], function ($, html_func_) {
  "use strict";

  class App {
    constructor() {}

    setData(oDataStore) {
      // console.log(oDataStore);
    }

    draw(oControlHost) {
      let elm = oControlHost.container;
      $(elm).append(`<h1>Yassin Rian</h1>`);
    }

    getParameter(sParameter) {
      console.log(sParameter);
    }
  }

  return App;
});

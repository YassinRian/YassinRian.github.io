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

    getParameters(oControlHost) {
      return [
        {
          parameter: "p_cluster",
          values: [{ use: "J10 Veilig" }],
        },
      ];
    }
  }

  return App;
});

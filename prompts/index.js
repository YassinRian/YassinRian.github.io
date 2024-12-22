define(["jquery", "https://yassinrian.github.io/prompts/html_func.js"], function ($,html_func_) {
  "use strict";

  class App {
    constructor() {
      this.data = null;
    }
  
    setData(oDataStore) {
      this.data = oDataStore.control.dataStores[0].json;
    }

    draw(oControlHost) // deze plaats alles globaal
     {

      let elm = oControlHost.container;
      $(elm).append(html_func_.html(this.data.columns));

      // Set data attributes(link tussen input en select)
      $("#box2").data({ select_class: "select_2" });

      // Set up event handlers
      $(".wis_selecties").on("click", html_func_.wis_selecties());
      $("input").on("keyup", html_func_.input_func(e));
    } // draw
  } // class

  return App;
});

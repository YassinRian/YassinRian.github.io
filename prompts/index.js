define(["jquery", "https://yassinrian.github.io/prompts/html_func.js"], function ($,html_func_) {
  "use strict";

  class App {
    constructor() {
      this.data = null;
      this.input_func = html_func_.input_func;
      this.wis_selecties = html_func_.wis_selecties;
      this.filter_lijst = html_func_.filter_lijst;
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
      $(".wis_selecties").on("click", (e) => this.wis_selecties(e.currentTarget));
      $("input").on("keyup", (e) => this.input_func(e, this.filter_lijst));
    } // draw
 
    getData() {
      return this.data;
    }
 
 
  } // class

  return App;
});

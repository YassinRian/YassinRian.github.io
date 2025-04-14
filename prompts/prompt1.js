define([
  "jquery",
  "https://yassinrian.netlify.app/prompts/html_func.js",
], function ($, html_func_) {
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
      console.log(oDataStore);
    }
  }
});

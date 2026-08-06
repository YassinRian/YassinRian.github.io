// App.js - Simple Cognos data logger
console.log("[App] Module loaded");

define([], function () {
  "use strict";

  class App {
    constructor() {
      console.log("[App] Constructor called");
      this.dataStore = null;
    }

    setData(oControlHost, dataStore, name) {
      console.log("========================================");
      console.log("[App] setData called");
      console.log("========================================");
      console.log("[App] name:", name);
      console.log("[App] dataStore:", dataStore);

      // Log all properties
      console.log("[App] dataStore keys:", Object.keys(dataStore));

      // Log each property individually
      for (var key in dataStore) {
        if (dataStore.hasOwnProperty(key)) {
          try {
            console.log("[App] dataStore." + key + ":", dataStore[key]);
          } catch (e) {
            console.log("[App] dataStore." + key + " ERROR:", e.message);
          }
        }
      }

      this.dataStore = dataStore;
    }

    draw(oControlHost) {
      console.log("========================================");
      console.log("[App] draw called");
      console.log("========================================");

      var container = oControlHost.container;
      var ds = this.dataStore;

      if (!ds) {
        container.innerHTML = "<p>No data received</p>";
        return;
      }

      // Simple display
      var html = '<div style="font-family: sans-serif; padding: 20px;">';
      html += '<h1>Cognos Data Structure</h1>';
      html += '<p>Check console (F12) for full dataStore object</p>';
      html += '<pre>' + JSON.stringify(ds, null, 2).substring(0, 5000) + '</pre>';
      html += '</div>';

      container.innerHTML = html;
    }
  }

  return App;
});

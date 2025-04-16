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

if (selectElement) {
  selectElement.style.width = "100%";
  selectElement.style.padding = "6px";
  selectElement.style.border = "1px solid #ddd";
  selectElement.style.borderRadius = "4px";
  selectElement.style.backgroundColor = "#fff";
  selectElement.style.color = "#333";
  
  // Add hover effects and focus styling
  selectElement.addEventListener("mouseover", function() {
    this.style.borderColor = "#999";
  });
  
  selectElement.addEventListener("mouseout", function() {
    this.style.borderColor = "#ddd";
  });
  
  selectElement.addEventListener("focus", function() {
    this.style.outline = "none";
    this.style.boxShadow = "0 0 3px rgba(0, 123, 255, 0.5)";
    this.style.borderColor = "#80bdff";
  });
  
  selectElement.addEventListener("blur", function() {
    this.style.boxShadow = "none";
    this.style.borderColor = "#ddd";
  });
}
    }

  }

  return App;
});

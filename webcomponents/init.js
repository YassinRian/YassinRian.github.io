define([
    "jquery",
    "https://yassinrian.github.io/webcomponents/alertStyleSheet.js",
    "https://yassinrian.github.io/webcomponents/webcomp1.js",
  ], function ($, styles, shoelace) {
    "use strict";
  
    class WebComponent {
      constructor() {
        this.init();
      }
  
      async init() {
        try {
          // Load styles and Shoelace components
          await styles.addShoelaceStylesheet();
          await shoelace.init();
          console.log("WebComponent initialized");
        } catch (error) {
          console.error("Error initializing WebComponent:", error);
        }
      }
  
      draw(oControlHost) {
        const elm = oControlHost.container;
  
        // Append Shoelace components
        $(elm).html(`
<sl-color-picker label="Select a color"></sl-color-picker>

        `);
      } // End of draw
    } // End of class
  
    return WebComponent;
  }); // End of define
  

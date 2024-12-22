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
       <div class="animation-overview">
  <sl-animation name="bounce" duration="2000" play><div class="box"></div></sl-animation>
  <sl-animation name="jello" duration="2000" play><div class="box"></div></sl-animation>
  <sl-animation name="heartBeat" duration="2000" play><div class="box"></div></sl-animation>
  <sl-animation name="flip" duration="2000" play><div class="box"></div></sl-animation>
</div>

<style>
  .animation-overview .box {
    display: inline-block;
    width: 100px;
    height: 100px;
    background-color: var(--sl-color-primary-600);
    margin: 1.5rem;
  }
</style>

        `);
      } // End of draw
    } // End of class
  
    return WebComponent;
  }); // End of define
  

define([
  "jquery",
  "https://yassinrian.github.io/webcomponents/webcomp1.js",
], function ($, shoelace) {
  "use strict";

  class WebComponent {
    constructor() {
      this.init();
    }

    async init() {
      await shoelace.loadShoelaceModule();
      console.log("WebComponent initialized");
    }

    draw(oControlHost) {
      const elm = oControlHost.container;
      $(elm).html(`
        <sl-alert open>
        <sl-icon slot="icon" name="info-circle"></sl-icon>
        This is a standard alert. You can customize its content and even the icon.
        </sl-alert>`);
    } // End of draw
  } // End of class

  return WebComponent;
}); // End of define

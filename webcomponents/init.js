define(["jquery", "https://yassinrian.github.io/webcomponents/webcomp1.js"], function ($, shoelace) {
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
        oControlHost.container.innerHTML = `
            <sl-alert type="info" open>
            <sl-icon slot="icon" name="info-circle"></sl-icon>
            <sl-button slot="dismiss" type="text"></sl-button>
            This is an alert!
            </sl-alert>`;
  }
} // End of class

  return WebComponent;
}); // End of define
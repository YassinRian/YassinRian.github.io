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
          styles.addShoelaceStylesheet();
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
          <sl-alert variant="primary" open>
            <sl-icon slot="icon" name="info-circle"></sl-icon>
            <strong>This is super informative</strong><br />
            You can tell by how pretty the alert is.
          </sl-alert>
  
          <br />
  
          <sl-alert variant="success" open>
            <sl-icon slot="icon" name="check2-circle"></sl-icon>
            <strong>Your changes have been saved</strong><br />
            You can safely exit the app now.
          </sl-alert>
  
          <br />
  
          <sl-alert variant="neutral" open>
            <sl-icon slot="icon" name="gear"></sl-icon>
            <strong>Your settings have been updated</strong><br />
            Settings will take effect on next login.
          </sl-alert>
  
          <br />
  
          <sl-alert variant="warning" open>
            <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
            <strong>Your session has ended</strong><br />
            Please login again to continue.
          </sl-alert>
  
          <br />
  
          <sl-alert variant="danger" open>
            <sl-icon slot="icon" name="exclamation-octagon"></sl-icon>
            <strong>Your account has been deleted</strong><br />
            We're very sorry to see you go!
          </sl-alert>
          <sl-animated-image
            src="https://shoelace.style/assets/images/tie.webp"
            alt="Animation of a shoe being tied"
          ></sl-animated-image>
        `);
      } // End of draw
    } // End of class
  
    return WebComponent;
  }); // End of define
  

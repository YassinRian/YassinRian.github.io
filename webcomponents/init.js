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
<sl-drawer label="Drawer" class="drawer-overview">
  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  <sl-button slot="footer" variant="primary">Close</sl-button>
</sl-drawer>

<sl-button>Open Drawer</sl-button>

<script>
  const drawer = document.querySelector('.drawer-overview');
  const openButton = drawer.nextElementSibling;
  const closeButton = drawer.querySelector('sl-button[variant="primary"]');

  openButton.addEventListener('click', () => drawer.show());
  closeButton.addEventListener('click', () => drawer.hide());
</script>

        `);
      } // End of draw
    } // End of class
  
    return WebComponent;
  }); // End of define
  

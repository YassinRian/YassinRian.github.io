define(["jquery"], function ($) {
  "use strict";

  return {
    // Dynamically load one or more Shoelace components
    loadShoelaceModules: async function (urls) {
      try {
        const promises = urls.map((url) => import(url)); // Import all component URLs
        const modules = await Promise.all(promises); // Wait for all modules to load
        console.log("Shoelace modules loaded successfully", modules);
      } catch (error) {
        console.error("Failed to load Shoelace modules:", error);
      }
    },

    // Initialize Shoelace components
    init: async function () {
      await this.loadShoelaceModules([
        "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.19.1/cdn/components/alert/alert.js",
        "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.19.1/cdn/shoelace.js",
        "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.19.1/cdn/shoelace.js"
      ]);
      console.log("Shoelace WebComponents initialized");
    },
  };
});

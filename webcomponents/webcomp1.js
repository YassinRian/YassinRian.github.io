define(["jquery"], function ($) {
  "use strict";

  return {
    loadShoelaceModule: async function () {
      try {
        const shoelaceModule = await import(
          "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.19.1/cdn/components/alert/alert.js"
        );
        console.log("Shoelace module loaded successfully", shoelaceModule);
      } catch (error) {
        console.error("Failed to load Shoelace module:", error);
      }
    },
  };
});

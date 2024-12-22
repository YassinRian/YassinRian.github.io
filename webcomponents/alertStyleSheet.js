define(function () {
  "use strict";

  return {
    addShoelaceStylesheet: function () {
      return new Promise((resolve, reject) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.19.1/cdn/themes/light.css";

        // Resolve when the stylesheet is loaded
        link.onload = () => {
          console.log("Shoelace stylesheet loaded successfully");
          resolve();
        };

        // Reject if there’s an error loading the stylesheet
        link.onerror = () => {
          console.error("Failed to load Shoelace stylesheet");
          reject(new Error("Failed to load Shoelace stylesheet"));
        };

        document.head.appendChild(link);
      });
    },
  };
});
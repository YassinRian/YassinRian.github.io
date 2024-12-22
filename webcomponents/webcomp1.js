define(["jquery"], function ($) {
    "use strict";
  
    return {
      loadShoelaceModule: async function () {
        try {
          // // Add the stylesheet dynamically
          // const link = document.createElement("link");
          // link.rel = "stylesheet";
          // link.href = "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.19.1/cdn/themes/light.css";
          // document.head.appendChild(link);
          // console.log("Shoelace stylesheet added successfully");
  
          // Load the Shoelace module
          const shoelaceModule = await import("https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.19.1/cdn/components/alert/alert.js");
          console.log("Shoelace module loaded successfully", shoelaceModule);
        } catch (error) {
          console.error("Failed to load Shoelace module or stylesheet:", error);
        }
      },
    };
  });
  
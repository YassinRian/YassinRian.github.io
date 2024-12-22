define(function () {
    "use strict";
  
    return {
      addShoelaceStylesheet: function () {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.19.1/cdn/themes/light.css";
        document.head.appendChild(link);
        console.log("Shoelace stylesheet added successfully");
      },
    };
  });
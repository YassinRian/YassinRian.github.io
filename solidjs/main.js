define(["jquery", "https://esm.sh/preact", "https://esm.sh/htm"], function (
  $,
  preact,
  htm
) {
  class Main {
    async initialize() {
      await this.loadDependencies();
    }

    loadDependencies() {
      // Create a new script element
      const script = document.createElement("script");
      // Set the script type to module
      script.type = "module";
      // Define the module imports and functionality
      script.textContent = `
        import { h, render } from ${preact};
        import {html} from ${htm};
      `;
      // Append the script to the body
      $("body").append(script);
    }

    draw(oControlHost) {
      elm = oControlHost.container;
      // Create your app
      const app = h("h1", null, "Hello World!");
      render(app, elm);
    }
  } //einde class
  return Main;
}); //einde define

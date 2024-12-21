define(["jquery"], function ($) {
  class Main {
    async initialize() {
      await this.loadDependencies();
    }

    loadDependencies() {
      require([
        "https://esm.sh/solid-js@1.8.1",
        "https://esm.sh/solid-js/web",
        "https://esm.sh/solid-js@1.8.1/html",
      ], (esm, web, html) => {
        // Create a new script element
        const script = document.createElement("script");
        // Set the script type to module
        script.type = "module";
        // Define the module imports and functionality
        script.textContent = `
      import {createSignal, onCleanup} from ${esm};
      import {render} from ${web}; 
      import {html} from ${html};
      `;

        // Append the script to the body
        $("body").append(script);
      });
    }

    draw(oControlHost) {
      const App = () => {
        const [count, setCount] = createSignal(0),
          timer = setInterval(() => setCount(count() + 1), 1000);
        onCleanup(() => clearInterval(timer));
        return html`<div>${count}</div>`;
      };

      elm = oControlHost.container;
      render(App, elm);
    }
  } //einde class
  return Main;
}); //einde define

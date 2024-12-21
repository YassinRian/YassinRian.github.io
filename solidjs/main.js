define(["jquery"], function ($) {
  class Main {
    constructor() {
      this.esm = null;
      this.web = null;
      this.html = null;
    }

    async initialize() {
      await this.loadDependencies();
    }

    loadDependencies() {
      require([
        "https://esm.sh/solid-js@1.8.1",
        "https://esm.sh/solid-js/web",
        "https://esm.sh/solid-js@1.8.1/html",
      ], (esm, web, html) => {
        this.esm = esm;
        this.web = web;
        this.html = html;
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

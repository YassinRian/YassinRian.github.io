define(["jquery", "https://esm.sh/preact", "https://esm.sh/htm"], function (
  $,
  preact,
  htm
) {
  const { h, render } = preact; // Extract `h` and `render` from Preact
  const { html } = htm; // Extract `html` from HTM

  class Main {
    draw(oControlHost) {
      elm = oControlHost.container;
      // Create your app
      const App = () => html`<h1>Hello World!</h1>`;
      render(h(App), elm);
    }
  } //einde class
  return Main;
}); //einde define

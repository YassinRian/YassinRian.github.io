define(["jquery"], function ($) {

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
            import { h, render } from 'https://esm.sh/preact';
            import htm from 'https://esm.sh/htm';

            // Initialize htm with Preact
            const html = htm.bind(h);

            function App (props) {
            return html`<h1>Hello ${props.name}!</h1>`;
            }

            render(html`<${App} name="World" />`, document.body);

        `;
        // Append the script to the body
        $("body").append(script);
      }

}
 //einde class
  return Main;
}); //einde define

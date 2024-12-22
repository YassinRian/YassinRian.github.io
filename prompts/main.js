define(["jquery",'https://yassinrian.github.io/prompts/index.js'], function ($, App) {
  function AppPrompts() {}

  AppPrompts.prototype.initialize = function (oControlHost) {
    console.log(oControlHost.page.getControlByName("prompt_control").instance)
  
  };

  AppPrompts.prototype.draw = function (oControlHost) {
    let elm = oControlHost.container;
    
    $(elm).append("<button id='btn_prompt'>Create Prompt</button>");
   
    $("#btn_prompt").on("click", () => {
      let ins_app = new App();
      ins_app.draw(oControlHost);
    });
   
  };

  return AppPrompts;
});

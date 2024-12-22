define(["jquery",'https://yassinrian.github.io/prompts/index.js'], function ($, App) {
  function AppPrompts() {}

  App.prototype.initialize = async function (oControlHost, fnDoneInitializing) {
    const oModuleInstance = await oControlHost.page.getControlByName("prompt_control").instance;

    //this.data = oModuleInstance.getData();
    console.log(oModuleInstance);
    fnDoneInitializing();
  };

  AppPrompts.prototype.draw = function (oControlHost) {
    let elm = oControlHost.container;
    
    $(elm).append("<button id='btn_prompt'>Create Prompt</button>");
   
    $("#btn_prompt").on("click", () => {
      oModuleInstance.draw(oControlHost);
    });
   
  };

  return AppPrompts;
});

define(["jquery",'https://yassinrian.github.io/prompts/index.js'], function ($, App) {
  
  
  function AppPrompts() {}

      // Initialize method: Now you can use basicControl since it's already loaded
      AppPrompts.prototype.initialize = function(oControlHost,fnDoneInitializing) {
        this.data = oControlHost.page.getControlByName("prompt_control").dataStores[0].json;
        fnDoneInitializing();  // Callback to indicate initialization is done
    }

  AppPrompts.prototype.draw = function (oControlHost) {
    let elm = oControlHost.container;
    
    $(elm).append("<button id='btn_prompt'>Create Prompt</button>");
   
    $("#btn_prompt").on("click", () => {
      let prompt = new App();
      //prompt.setData(this.data);
      prompt.draw(oControlHost);
    });
   
  };

  return AppPrompts;
});

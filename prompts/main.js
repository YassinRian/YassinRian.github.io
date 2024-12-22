define(["jquery",'https://yassinrian.github.io/prompts/index.js'], function ($, App) {
  
  
  function AppPrompts() {}

      // Initialize method: Now you can use basicControl since it's already loaded
      AppPrompts.prototype.initialize = function(fnDoneInitializing) {
        let _app = new App();  // Create an instance of basicControl
        this.data = _app.getData();  // Store the data on the instance (this)
        fnDoneInitializing();  // Callback to indicate initialization is done
    }

  AppPrompts.prototype.draw = function (oControlHost) {
    let elm = oControlHost.container;
    
    $(elm).append("<button id='btn_prompt'>Create Prompt</button>");
   
    $("#btn_prompt").on("click", () => {
      console.log(this.data);
    });
   
  };

  return AppPrompts;
});

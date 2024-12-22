define(["jquery",'https://yassinrian.github.io/prompts/index.js'], function ($, AppPrompts) {
  function AppPrompts() {}


      // Initialize method: Now you can use basicControl since it's already loaded
      AppPrompts.prototype.initialize = function(fnDoneInitializing) {
        let _basicControl = new AppPrompts();  // Create an instance of basicControl
        this.data = _basicControl.getData();  // Store the data on the instance (this)
        console.log(this.data);  // You can log the data here
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

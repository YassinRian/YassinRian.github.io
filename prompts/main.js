define(["jquery"], function ($) {
  function AppPrompts() {}

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

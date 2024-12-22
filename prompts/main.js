define(["jquery"], function ($) {
  function AppPrompts() {}

  AppPrompts.prototype.setData = function (oDataStore) {
    this.data = oDataStore;
  };
  
  AppPrompts.prototype.draw = function (oControlHost) {
    console.log(this.data);
  };

  return AppPrompts;
});

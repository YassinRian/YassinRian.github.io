define(["jquery"], function ($) {
  function AppPrompts() {}

  AppPrompts.prototype.setData = function (oDataStore) {
    this.data = oDataStore;
  };
  
  AppPrompts.prototype.draw = function (oControlHost) {
    let bla = new this.data();

    console.log(bla.control);
  };

  return AppPrompts;
});

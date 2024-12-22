define(["jquery"], function ($) {
  function AppPrompts() {}

  AppPrompts.prototype.setData = function (oDataStore) {
    this.data = oDataStore;
  }

  AppPrompts.prototype.initialize = async function (oControlHost, fnDoneInitializing) {
    this.data = await oControlHost.data.get();
    console.log(this.data);
    fnDoneInitializing();
  };
  return AppPrompts;
  
});

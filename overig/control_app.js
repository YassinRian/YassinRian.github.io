define(["jquery"], function ($) {
  function App() {}

  App.prototype.initialize = async function (oControlHost, fnDoneInitializing) {
    const oModuleInstance = await oControlHost.page.getControlByName("Control1").instance;
    //this.data = oModuleInstance.getData();
    console.log(oModuleInstance);
    fnDoneInitializing();
  };

  App.prototype.draw = function (oControlHost) {
    const elm = oControlHost.container;
    $(elm).append("<h1>Hallo Control2</h1>");
  };
  return App;
}); // einde define

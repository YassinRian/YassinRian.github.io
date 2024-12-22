define(["jquery"], function ($) {
  function App() {}

  App.prototype.initialize = async function (oControlHost, fnDoneInitializing) {
    const oModuleInstance = await oControlHost.page.getControlByName("Control1").instance;
    this.data = oModuleInstance.getData();
    console.log(oModuleInstance);
    fnDoneInitializing();
  };

  App.prototype.draw = function (oControlHost) {
    const elm = oControlHost.container;
    $(elm).append("<h1>Hallo Yassin</h1>");
    console.log(this.data);
  };
  return App;
}); // einde define

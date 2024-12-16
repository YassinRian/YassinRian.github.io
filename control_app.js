define(['jquery'], function($){

    function App(){};

    App.prototype.initialize = async function(fnDoneInitializing) {
        const oModuleInstance = await oControlHost.page.getControlByName( "Control1" ).instance;
        this.data = oModuleInstance.getData();
        fnDoneInitializing();
    }

    App.prototype.draw = function(oControlHost) {
        const elm = oControlHost.container;
        $(elm).append('<h1>Hallo Yassin</h1>');
        console.log(this.data);
    }
    return App;
}); // einde define
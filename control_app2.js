define(['jquery'], function($){

    function App(){};

    App.prototype.draw = function(oControlHost) {
        const elm = oControlHost.container;
        $(elm).append('<button id="button_yassin">Hallo Yassin</button>');
       console.log(this.data);
       
       $("#button_yassin").on('click', async function(){

        App.prototype.initialize = async function(oControlHost,fnDoneInitializing) {
            const oModuleInstance = await oControlHost.page.getControlByName( "Control1" ).instance;
            this.data = oModuleInstance.getData();
            fnDoneInitializing();
        }
        

       })
    }

    return App;
}); // einde define
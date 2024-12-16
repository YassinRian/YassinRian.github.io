define(['jquery'], function($){

    function App(){};

    App.prototype.draw = function(oControlHost) {
        const elm = oControlHost.container;
        $(elm).append('<button id="button_yassin">Hallo Yassin</button>');
       
       $("#button_yassin").on('click', async function(){

        App.prototype.initialize = async function(oControlHost,fnDoneInitializing) {
            const oModuleInstance = await oControlHost.page.getControlByName( "Control1" ).instance;
            this.data = oModuleInstance.getData();
            fnDoneInitializing();
        }
        
        let app_ = new App();
        console.log(app_.this.data)

       })
    }

    return App;
}); // einde define
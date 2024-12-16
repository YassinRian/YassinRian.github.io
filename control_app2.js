define(['jquery'], function($){

    function App(){};

    App.prototype.draw = function(oControlHost) {
        const elm = oControlHost.container;
        $(elm).append('<button id="button_yassin">Hallo Yassin</button>');
       
       $("#button_yassin").on('click', async function(oControlHost){

            const oModuleInstance = await oControlHost.page.getControlByName( "Control1" ).instance;
            this.data = oModuleInstance.getData();
            console.log(this.data);
   

       })
    }

    return App;
}); // einde define
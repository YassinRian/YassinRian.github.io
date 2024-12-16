define(['jquery', 'https://yassinrian.github.io/control_data.js'], function($, data_){

    function App(){};

    App.prototype.draw = function(oControlHost) {
        const elm = oControlHost.container;
        $(elm).append('<button id="button_yassin">Hallo Yassin</button>');
       
       $("#button_yassin").on('click', async function(){

            //const oModuleInstance = await oControlHost.page.getControlByName( "Control1" ).instance;
            //this.data = oModuleInstance.getData();
        const oModuleInstance = await data_.instance;
        console.log(oModuleInstance.getData());
   

       })
    }

    return App;
}); // einde define
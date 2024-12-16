define(['jquery', 'https://yassinrian.github.io/control_data.js'], function($, data_){

    function App(){};

    App.prototype.draw = function(oControlHost) {
        const elm = oControlHost.container;
        $(elm).append('<button id="button_yassin">Hallo Yassin</button>');
       
       $("#button_yassin").on('click', async function(){

            //const oModuleInstance = await oControlHost.page.getControlByName( "Control1" ).instance;
            //this.data = oModuleInstance.getData();

            let data_ins = new App();

            data_ins.prototype.initialize = async function(oControlHost,fnDoneInitializing) {
                const oModuleInstance = await oControlHost.page.getControlByName( "Control1" ).instance;
                this.data = oModuleInstance.getData();
                fnDoneInitializing();
            }

            console.log(this.data)
            
 
   

       })
    }

    return App;
}); // einde define
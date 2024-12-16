define(['jquery','https://yassinrian.github.io/control_data.js'], function($, data_){

    function App(){};

    App.prototype.load = async function(fnDoneInitializing) {
        //const oModuleInstance = await oControlHost.page.getControlByName( "Control1" ).instance;
        let data_inst = new data_();
        this.data = await data_inst.getData();
        fnDoneInitializing();
    }

    App.prototype.draw = function(oControlHost) {
        const elm = oControlHost.container;
        $(elm).append('<button id="button_yassin">Hallo Yassin</button>');
       //console.log(this.data);
       $("#button_yassin").on('click', function(){
        let app_inst = new App();
        console.log(app_inst.getData());
       })
    }

    App.prototype.getData = function() {
        return this.data;
    }
    
    return App;
}); // einde define
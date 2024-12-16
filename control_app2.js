define(['jquery','https://yassinrian.github.io/control_data.js'], function($, data_){

    function App(){};

    App.prototype.hallo = async function() {
        //const oModuleInstance = await oControlHost.page.getControlByName( "Control1" ).instance;
        let data_inst = new data_();
        let data = await data_inst.getData();
        //return this.data
        console.log(data)
        //return data
    }

    App.prototype.draw = function(oControlHost) {
        const elm = oControlHost.container;
        $(elm).append('<button id="button_yassin">Hallo Yassin</button>');
       //console.log(this.data);
       $("#button_yassin").on('click', async function(){
        let data_inst = new data_();
        let data = await data_inst.getData();
        console.log(data)
       })
    }

    return App;
}); // einde define
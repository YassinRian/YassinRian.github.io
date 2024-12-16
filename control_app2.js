define(['jquery','https://yassinrian.github.io/control_data.js'], function($, data_){

    function App(){};

    App.prototype.hallo = async function() {
        //const oModuleInstance = await oControlHost.page.getControlByName( "Control1" ).instance;
        //let data_inst = new data_();
        //this.data = await data_inst.getData();
        //return this.data
        return data_
    }

    App.prototype.draw = function(oControlHost) {
        const elm = oControlHost.container;
        $(elm).append('<button id="button_yassin">Hallo Yassin</button>');
       //console.log(this.data);
       $("#button_yassin").on('click', function(){
        let data2 = new App();
        console.log(data2.hallo());
       })
    }

    return App;
}); // einde define
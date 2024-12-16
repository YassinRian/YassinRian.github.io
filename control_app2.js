define(['jquery','https://yassinrian.github.io/control_data.js'], function($, data_){

    function App(){};

    App.prototype.draw = function(oControlHost) {
        const elm = oControlHost.container;
        $(elm).append('<button id="button_yassin">Hallo Yassin</button>');
       //console.log(this.data);
       $("#button_yassin").on('click', async function(){
        let data_inst = await new data_();
        let data = await data_inst.getData();
        console.log(data)
       })
    }

    return App;
}); // einde define
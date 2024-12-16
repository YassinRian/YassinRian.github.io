define(['jquery','https://yassinrian.github.io/control_data.js'], function($){

    function App(){};

    App.prototype.draw = function(oControlHost) {
        const elm = oControlHost.container;
        $(elm).append('<button id="button_yassin">Hallo Yassin</button>');
       //console.log(this.data);
       $("#button_yassin").on('click', async function(){
        let data_inst = new BasicControl();
        let data = await data_inst.getData();
        console.log(data)
       })
    }

    return App;
}); // einde define
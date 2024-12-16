define(['jquery','https://yassinrian.github.io/control_data.js'], function($, data_){

    function App(){};


    App.prototype.draw = function(oControlHost) {
        const elm = oControlHost.container;
        $(elm).append('<button id="button_yassin">Hallo Yassin</button>');
       //console.log(this.data);
       $("#button_yassin").on('click', function(){
        let data_inst = new data_();
        console.log(data_inst.getData());
       })
    }
    return App;
}); // einde define
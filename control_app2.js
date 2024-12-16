define(['jquery', 'https://yassinrian.github.io/control_data2.js'], function($, data_){

    function App(){};

    App.prototype.draw = function(oControlHost) {
        const elm = oControlHost.container;
        $(elm).append('<button id="button_yassin">Load Control</button>');
        
        $('#button_yassin').on('click', function() {
            console.log("input click werkt !!");
            let data_ins = new data_();
            console.log(data_.getData());           
        })
    }
    return App;
}); // einde define
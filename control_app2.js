define(['jquery', 'https://yassinrian.github.io/control_data2.js'], function($, data){

    function App(){};

    App.prototype.draw = function(oControlHost) {
        const elm = oControlHost.container;
        $(elm).append('<input>Load Control</input>');
        
        $('input').on('click', function() {
            console.log("input click werkt !!");
            console.log(data.getData());           
        })
    }
    return App;
}); // einde define
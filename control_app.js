define(['jquery'], function($){

    function App(){};

    App.prototype.draw = function(oControlHost) {
        const elm = oControlHost.container;
        $(elm).append('<h1>Hallo Yassin</h1>');
    }
    return App;
}); // einde define
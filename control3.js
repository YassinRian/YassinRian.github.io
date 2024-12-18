define(['jquery'], function($){
    
    function App() {};

    App.prototype.draw = function(oControlHost) {
        console.log(oControlHost);
    }

    return App;
})
define(['jquery'], function ($) {

    function Create_select () {};

    Create_select.prototype.initialize = function() {
                setTimeout(function () {
                    alert('Delayed oDataStore (after 5 seconds): hallo yassin');
                }, 5000);
    }


  
});

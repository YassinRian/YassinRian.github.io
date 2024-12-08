define(['jquery'], function ($) {

    function Create_select () {};

    Create_select.prototype.draw = function(oDataStore) {
                setTimeout(function () {
                    $(window.top.document).alert('Delayed oDataStore (after 5 seconds): hallo yassin');
                }, 5000);
    }


  
});

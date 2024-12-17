define(['jquery', 'https://yassinrian.github.io/create_select.js'], function($, basicControl){

    function App(){};

    App.prototype.draw = function(oControlHost) {
        const elm = oControlHost.container;
        $(elm).append('<button id="button_yassin">Hallo Yassin</button>');
        // console.log(oControlHost.page.getControlByName("Control1").instance)
       
     $("#button_yassin").on('click', async function(){
        console.log("geklikt");

        let app_inst = new basicControl();           
        await app_inst.draw(oControlHost);
              
      });
    }

    return App;
}); // einde define
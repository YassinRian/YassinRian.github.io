define(['jquery', 'https://yassinrian.github.io/control_data.js'], function($, basicControl){

    function App(){};

    App.prototype.draw = function(oControlHost) {
        const elm = oControlHost.container;
        $(elm).append('<button id="button_yassin">Hallo Yassin</button>');
        // console.log(oControlHost.page.getControlByName("Control1").instance)
       
     $("#button_yassin").on('click', async function(){
        console.log("geklikt");

        let app_inst = new basicControl();           
        await app_inst.setData(oDataStore)
        await app_inst.draw(oControlHost);
        console.log(app_inst.getData());       
            
      });
    }

    return App;
}); // einde define
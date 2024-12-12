define( () => {
    "use strict";

    class App
    {

        initialize( oControlHost, fnDoneInitializing )
        {
        require( ["https://yassinrian.github.io/basic_control2.js"], this.dependenciesLoaded.bind( this, fnDoneInitializing ) )
        }

        dependenciesLoaded( fnDoneInitializing, oModule )
        {
         console.log(oModule)
         let bla = new oModule();
         console.log(bla);
         fnDoneInitializing();
        }
         

        draw(oControlHost)
        {
            oControlHost.container.innerHTML = "Hello World!";
            //console.log(this.data);
        }
    }

    return App;

})
 
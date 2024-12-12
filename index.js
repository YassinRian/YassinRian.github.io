define( () => {
    "use strict";

    class BasicControl
    {

        initialize( oControlHost, fnDoneInitializing )
        {
        require( ["https://yassinrian.github.io/basic_control2.js"], this.dependenciesLoaded.bind( this, fnDoneInitializing ) )
        }
         
        dependenciesLoaded( fnDoneInitializing, oModule )
        {
         this.data = oModule.getData();
        fnDoneInitializing();
        }

        draw(oControlHost)
        {
            oControlHost.container.innerHTML = "Hello World!";
            console.log(this.data);
        }
    }

    return BasicControl;

})
 
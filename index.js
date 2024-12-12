define( () => {
    "use strict";

    class App
    {

        // initialize( oControlHost, fnDoneInitializing )
        // {
        // require( ["https://yassinrian.github.io/basic_control2.js"], this.dependenciesLoaded.bind( this, fnDoneInitializing ) )
        // }
         
        initialize()
        {
        return new Promise( fnResolve =>
        {
            require( ["https://yassinrian.github.io/basic_control2.js"], MyCode =>
            {
                this.data = MyCode;
                fnResolve();
            } );
        } );
        }

        draw(oControlHost)
        {
            oControlHost.container.innerHTML = "Hello World!";
            console.log(this.data);
        }
    }

    return App;

})
 
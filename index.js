define( () => {
    "use strict";

    class BasicControl
    {
        draw(oControlHost)
        {
            oControlHost.container.innerHTML = "Hello World!";
        }
    }

    return BasicControl;

})
 
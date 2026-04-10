define(["jquery"], function($){
    "use strict";

    class App {
        constructor() {} // momenteel niet nodig

        draw(oControlHost) {
            let cnt = oControlHost.container;
            $(cnt).append("<div class=\"test\">Hallo Yassin</div>");

            $(".test").on("click", (e) => {$(cnt).append("<h4>Cool!</h4>")})

        }
    }

    return App;
})

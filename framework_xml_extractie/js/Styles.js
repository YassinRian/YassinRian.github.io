define([], function() {
    "use strict";

    const css = `

    .cognos-extractor-wrapper {
        font-family: 'Segoe UI', Tahoma, sans-serif;
        border: 1px solid #d1d1d1;
        padding: 15px;
        background: #fff;
    }

    .cognos-extractor-status {
        color: #005fb8;
        font-weight: bold;
        margin: 10px 0;
    }

    .cognos-extractor-log {
        background: #222;
        color: #adff2f;
        padding: 10px;
        font-family: monospace;
        height: 200px;
        overflow-y: scroll;
        border-radius: 4px;
    }
    `;                          /*einde CSS*/


    return {
        inject: function() {
            const id = "cognos-extractor-styles";
            if (!document.getElementById(id)) { /*als die niet bestaat dan maken we het aan in de Head van de pagina*/
                const style = document.createElement('style');
                style.id = id;
                style.innerHTML = css;
                document.head.appendChild(style);
            }
        }
    };
});

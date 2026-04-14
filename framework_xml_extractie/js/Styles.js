define([], function () {
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



    /* SQL Highlighting Colors */
    .sql-keyword { color: #569cd6; font-weight: bold; } /* Blue for SELECT, FROM... */
    .sql-string  { color: #ce9178; }                   /* Orange/Red for 'strings' */
    .sql-bracket { color: #ffd700; }                   /* Gold for [TableNames] */
    .sql-function { color: #dcdcaa; }                  /* Yellowish for SUM, COUNT... */


    .layer-tab {
        padding: 8px 16px;
        border: 1px solid #005fb8;
        background: white;
        color: #005fb8;
        cursor: pointer;
        border-radius: 4px;
        font-weight: bold;
        transition: all 0.2s;
    }

    .layer-tab:hover {
        background: #f0f7ff;
    }

    .layer-tab.active {
        background: #005fb8;
        color: white;
    }

    .search-match {
        background-color: #fff3cd; /* Soft yellow */
        color: #856404;            /* Darker text for contrast */
        padding: 0 2px;
        border-radius: 2px;
        font-weight: bold;
        border: 1px solid #ffeeba;
    }

    /* Multi-color highlights */
.match-0 { background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba; } /* Yellow */
.match-1 { background-color: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; } /* Blue */
.match-2 { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; } /* Green */
.match-3 { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; } /* Red */
.match-4 { background-color: #e2e3e5; color: #383d41; border: 1px solid #d6d8db; } /* Grey */


    `;                          /*einde CSS*/


    return {
        inject: function () {
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

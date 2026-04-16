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


.card {
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    margin-bottom: 25px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    overflow: hidden;
}

.card-header {
    background: #f8f9fa;
    padding: 10px 15px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.column-badge {
    display: inline-block;
    background: #e9ecef;
    color: #495057;
    padding: 4px 10px;
    margin: 3px;
    border-radius: 4px;
    font-size: 11px;
    font-family: sans-serif;
    border: 1px solid #dee2e6;
}

.sql-block {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 15px;
    margin: 0;
    font-family: 'Consolas', monospace;
    font-size: 12px;
    white-space: pre-wrap;
    overflow-x: auto;
    tab-size: 4;
    line-height: 1.5;

}

.toggle-view {
    padding: 4px 10px;
    font-size: 11px;
    cursor: pointer;
    border: 1px solid #ccc;
    background: white;
}

.toggle-view.active {
    background: #005fb8;
    color: white;
    border-color: #005fb8;
}


.sql-container {
    position: relative;
    width: 100%;
}

.copy-sql-btn {
    position: absolute;
    top: 10px;
    right: 15px;
    padding: 6px 12px;
    background: #444;
    color: #efefef;
    border: 1px solid #666;
    border-radius: 4px;
    font-size: 11px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 10;
}

.copy-sql-btn:hover {
    background: #555;
    border-color: #888;
}

.copy-sql-btn.success {
    background: #28a745;
    border-color: #28a745;
    color: white;
}



.clickable-sql {
    cursor: pointer;
    transition: opacity 0.2s;
}

.clickable-sql:hover {
    border: 1px solid #444; /* Kleine highlight bij hover */
}

/* Zorg dat de clean-version wel de SQL-kleuren (syntax highlighting) behoudt, 
   maar niet de gele/blauwe zoek-matches! */
.clean-version .search-match {
    background: transparent !important;
    border: none !important;
    color: inherit !important;
}


.breadcrumb-container {
    display: flex;
    align-items: center;
    overflow: hidden; /* Zorgt dat ellips werkt */
    white-space: nowrap;
    max-width: 70%; /* Voorkomt dat het de knoppen raakt */
}

.folder-path {
    font-size: 11px; 
    color: #888; 
    text-transform: uppercase; 
    letter-spacing: 0.5px;
    overflow: hidden;
    text-overflow: ellipsis; /* Voegt '...' toe als het te lang is */
    white-space: nowrap;
    display: inline-block;
    vertical-align: middle;
}



    `; /*einde CSS*/

  return {
    inject: function () {
      const id = "cognos-extractor-styles";
      if (!document.getElementById(id)) {
        /*als die niet bestaat dan maken we het aan in de Head van de pagina*/
        const style = document.createElement("style");
        style.id = id;
        style.innerHTML = css;
        document.head.appendChild(style);
      }
    },
  };
});

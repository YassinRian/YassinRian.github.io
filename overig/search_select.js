
define( () => {
   "use strict";

   /*
    * Search & Select custom control — IBM Cognos Analytics 12 (Scriptable Reports API)
    *
    * Draws a search box + selection list, reads options from a hidden value prompt
    * bound to the parameter, and applies a configurable DEFAULT search operator.
    * The operator is read from the control's Configuration JSON, so every prompt
    * instance can default to a different operator.
    *
    * Configuration JSON (the "Configuration" property of the custom control):
    * {
    *   "promptName":    "prompt-pProduct",   // name of the hidden value prompt
    *   "searchOperator":"containsAny",        // default search operator (see table)
    *   "placeholder":   "Search products...",
    *   "multiSelect":   true,
    *   "autoSubmit":    false,                 // true = re-run report on change
    *   "noResultsText": "No matches"
    * }
    */

   class SearchSelectControl
   {
       initialize( oControlHost, fnDoneInitializing )
       {
           const cfg = oControlHost.configuration || {};

           this.promptName     = cfg.promptName || null;
           this.searchOperator = cfg.searchOperator || "containsAny"; // the 3rd option
           this.placeholder    = cfg.placeholder || "Search...";
           this.multiSelect    = cfg.multiSelect !== false;
           this.autoSubmit     = cfg.autoSubmit === true;
           this.noResultsText  = cfg.noResultsText || "No matches";

           this.oControlHost = null;
           this.id           = null;
           this.aOptions     = [];   // full option list: { use, display }
           this.aSelected    = [];   // currently selected: { use, display }
           this.sSearch      = "";

           fnDoneInitializing();
       }

       draw( oControlHost )
       {
           this.oControlHost = oControlHost;
           this.id = oControlHost.generateUniqueID();

           this._loadOptions();
           this._loadSelection();

           oControlHost.container.innerHTML = this._buildHtml();
           this._bindEvents();
           this._renderList();
       }

       destroy()
       {
           // nothing to clean up
       }

       // ---- data source: the hidden value prompt -----------------------

       _getPrompt()
       {
           if ( !this.promptName ) return null;
           const p = this.oControlHost.page.getControlByName( this.promptName );
           return ( p && typeof p.getValues === "function" ) ? p : null;
       }

       _loadOptions()
       {
           this.aOptions = [];
           const p = this._getPrompt();
           if ( !p ) return;

           const aAll = p.getValues( true ) || [];      // true => all options
           this.aOptions = aAll.map( v => {
               const use = v.use;
               const display = ( v.display !== undefined && v.display !== null ) ? v.display : use;
               return { use: use, display: String( display ) };
           } );
       }

       _loadSelection()
       {
           this.aSelected = [];
           const p = this._getPrompt();
           if ( !p ) return;

           const aSel = p.getValues() || [];           // only selected values
           const setSel = new Set( aSel.map( v => v.use ) );
           this.aSelected = this.aOptions
               .filter( o => setSel.has( o.use ) )
               .map( o => ({ use: o.use, display: o.display }) );
       }

       // ---- search operators -------------------------------------------

       _tokenize( s )
       {
           return String( s || "" ).toLowerCase().split( /\s+/ ).filter( Boolean );
       }

       _matches( sValue, aKeywords )
       {
           const v = String( sValue || "" ).toLowerCase();
           if ( aKeywords.length === 0 ) return true;

           switch ( this.searchOperator )
           {
               case "startsWithAny":
                   return aKeywords.some( k => v.indexOf( k ) === 0 );

               case "startsWithFirstContainsRest":
               {
                   const first = aKeywords[0];
                   const rest  = aKeywords.slice( 1 );
                   if ( v.indexOf( first ) !== 0 ) return false;
                   return rest.every( k => v.indexOf( k ) !== -1 );
               }

               case "containsAll":
                   return aKeywords.every( k => v.indexOf( k ) !== -1 );

               case "containsAny":
               default:
                   return aKeywords.some( k => v.indexOf( k ) !== -1 );
           }
       }

       // ---- UI ----------------------------------------------------------

       _buildHtml()
       {
           return `
           <div id="${this.id}" style="font-family:inherit;">
               <input type="search" id="${this.id}-search"
                      placeholder="${this._escapeAttr( this.placeholder )}"
                      autocomplete="off"
                      style="width:100%; box-sizing:border-box; padding:6px 8px;
                             border:1px solid #9e9e9e; border-radius:3px;
                             margin-bottom:6px;" />
               <div id="${this.id}-list"
                    style="max-height:220px; overflow:auto; border:1px solid #e0e0e0;
                           border-radius:3px; padding:4px;"></div>
           </div>`;
       }

       _bindEvents()
       {
           const elSearch = document.getElementById( this.id + "-search" );
           const elList   = document.getElementById( this.id + "-list" );

           elSearch.addEventListener( "input", e => {
               this.sSearch = e.target.value;
               this._renderList();
           } );

           elList.addEventListener( "click", e => {
               const item = e.target.closest( "[data-index]" );
               if ( !item ) return;
               const i = parseInt( item.getAttribute( "data-index" ), 10 );
               this._toggle( i );
           } );
       }

       _toggle( iIndex )
       {
           const opt = this.aOptions[ iIndex ];
           if ( !opt ) return;

           const already = this.aSelected.some( o => o.use === opt.use );

           if ( this.multiSelect )
           {
               this.aSelected = already
                   ? this.aSelected.filter( o => o.use !== opt.use )
                   : this.aSelected.concat([{ use: opt.use, display: opt.display }]);
           }
           else
           {
               this.aSelected = already ? [] : [{ use: opt.use, display: opt.display }];
           }

           this._renderList();
           this._applyToPrompt();
       }

       _applyToPrompt()
       {
           const p = this._getPrompt();
           if ( !p ) return;

           p.setValues( this.aSelected.map( o => ({ use: o.use, display: o.display }) ) );

           // Optional live/auto-submit behaviour. Off by default because the
           // prompt page's Finish button already submits the (hidden) prompt value.
           if ( this.autoSubmit )
           {
               this.oControlHost.valueChanged();
           }
       }

       _renderList()
       {
           const elList = document.getElementById( this.id + "-list" );
           if ( !elList ) return;

           const aKeywords = this._tokenize( this.sSearch );
           const aVisible  = this.aOptions
               .map( ( o, i ) => ({ o, i }) )
               .filter( x => this._matches( x.o.display, aKeywords ) );

           if ( aVisible.length === 0 )
           {
               elList.innerHTML = `<div style="padding:8px; color:#757575;">${this._escapeHtml( this.
  noResultsText )}</div>`;
               return;
           }

           const setSel = new Set( this.aSelected.map( o => o.use ) );

           elList.innerHTML = aVisible.map( x => {
               const checked = setSel.has( x.o.use );
               const input = this.multiSelect
                   ? `<input type="checkbox" ${checked ? "checked" : ""} tabindex="-1"
                             style="margin:0 6px 0 0; vertical-align:middle;" />`
                   : `<input type="radio" name="${this.id}-radio" ${checked ? "checked" : ""} tabindex="-1"
                             style="margin:0 6px 0 0; vertical-align:middle;" />`;

               return `
                   <label data-index="${x.i}"
                          style="display:block; padding:5px 6px; cursor:pointer; border-radius:2px;">
                       ${input}
                       <span>${this._escapeHtml( x.o.display )}</span>
                   </label>`;
           } ).join( "" );
       }

       // ---- helpers ------------------------------------------------------

       _escapeHtml( s )
       {
           return String( s ?? "" )
               .replace( /&/g, "&amp;" )
               .replace( /</g, "&lt;" )
               .replace( />/g, "&gt;" )
               .replace( /"/g, "&quot;" )
               .replace( /'/g, "&#39;" );
       }

       _escapeAttr( s )
       {
           return this._escapeHtml( s );
       }
   }

   return SearchSelectControl;
   } );
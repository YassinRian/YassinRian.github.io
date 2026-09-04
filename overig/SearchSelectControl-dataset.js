/*
 * Search & Select custom control — IBM Cognos Analytics 12 (Scriptable Reports API)
 * DATASET EDITION (no hidden value prompt)
 *
 * Draws its own search box + selection list, reads the option list from the
 * custom control's OWN authored dataset via setData()/DataStore, and fulfills
 * the target parameter directly via getParameters(). Because the control itself
 * is the parameter's prompt, there is no hidden value prompt to maintain.
 *
 * Configuration JSON (the "Configuration" property of the custom control):
 * {
 *   "parameter":     "pProduct",        // parameter this control fulfills (required)
 *   "dataSet":       "Products",        // optional: name of the authored dataset (defaults to first)
 *   "useColumn":     "Product key",     // column used as the submitted value (name or 0-based index; default first column)
 *   "displayColumn": "Product name",    // column used as the visible label (defaults to useColumn)
 *   "searchOperator":"containsAny",     // default search operator (see table below)
 *   "placeholder":   "Search products...",
 *   "multiSelect":   true,
 *   "required":      false,             // true = Finish disabled until a value is selected
 *   "noResultsText": "No matches",
 *   "sortColumn":    "Product name",    // optional client-side sort
 *   "sortAscending": true
 * }
 *
 * Search operators (same as the native options):
 *   1 startsWithAny
 *   2 startsWithFirstContainsRest
 *   3 containsAny   (default)
 *   4 containsAll
 */

define( () => {
    "use strict";

    class SearchSelectControl
    {
        initialize( oControlHost, fnDoneInitializing )
        {
            const cfg = this._parseConfig( oControlHost );

            this.parameter      = cfg.parameter || null;
            this.dataSet        = cfg.dataSet || null;
            this.useColumn      = cfg.useColumn;                 // name | index | undefined
            this.displayColumn  = cfg.displayColumn;             // name | index | undefined
            this.searchOperator = cfg.searchOperator || "containsAny";
            this.placeholder    = cfg.placeholder || "Search...";
            this.multiSelect    = this._toBool( cfg.multiSelect, true );
            this.required       = this._toBool( cfg.required, false );
            this.noResultsText  = cfg.noResultsText || "No matches";
            this.sortColumn     = cfg.sortColumn;                // name | index | undefined
            this.sortAscending  = this._toBool( cfg.sortAscending, true );

            this.id          = null;
            this.oDataStore  = null;
            this.aDataStores = [];
            this.aOptions    = [];   // full option list: { use, display }
            this.aSelected   = [];   // currently selected:  { use, display }
            this.sSearch     = "";

            fnDoneInitializing();
        }

        /*
         * Called by Cognos when authored data is attached to the control.
         * May be called once per authored dataset.
         */
        setData( oControlHost, oDataStore )
        {
            if ( oDataStore )
            {
                this.aDataStores.push( oDataStore );
                this.aDataStores.sort( ( a, b ) => ( a.index | 0 ) - ( b.index | 0 ) );
            }
            this._resolveDataStore();
            this._loadOptions();
        }

        draw( oControlHost )
        {
            this.oControlHost = oControlHost;
            this.id = oControlHost.generateUniqueID();

            // In case setData fired after the first draw (defensive).
            this._resolveDataStore();
            if ( this.oDataStore && this.aOptions.length === 0 )
            {
                this._loadOptions();
            }

            this._restoreSelection( oControlHost );

            oControlHost.container.innerHTML = this._buildHtml();
            this._bindEvents();
            this._renderList();
        }

        /*
         * Called by Cognos to collect the parameter value(s) this control
         * fulfills. This is what replaces the hidden value prompt.
         */
        getParameters( oControlHost )
        {
            if ( !this.parameter ) return null;

            return [ {
                parameter : this.parameter,
                values    : this.aSelected.map( o => ( { use: o.use, display: o.display } ) )
            } ];
        }

        isInValidState( oControlHost )
        {
            return this.required ? ( this.aSelected.length > 0 ) : true;
        }

        destroy()
        {
            // nothing to clean up
        }

        // ---- data source: the authored dataset ---------------------------

        _resolveDataStore()
        {
            let ds = null;
            if ( this.dataSet )
            {
                ds = this.aDataStores.find( d => d.name === this.dataSet );
            }
            if ( !ds && this.aDataStores.length )
            {
                ds = this.aDataStores[ 0 ];
            }
            this.oDataStore = ds || null;
        }

        _resolveColumn( oDataStore, spec, iDefault )
        {
            if ( spec === undefined || spec === null || spec === "" )
            {
                return iDefault;
            }
            if ( typeof spec === "number" )
            {
                return spec;
            }

            const names = oDataStore.columnNames || [];
            let i = names.indexOf( spec );
            if ( i === -1 && typeof oDataStore.getColumnIndex === "function" )
            {
                i = oDataStore.getColumnIndex( spec );
            }
            return ( i === -1 || isNaN( i ) ) ? iDefault : i;
        }

        _loadOptions()
        {
            this.aOptions = [];
            const ds = this.oDataStore;
            if ( !ds || !ds.rowCount ) return;

            const iUse = this._resolveColumn( ds, this.useColumn, 0 );
            const iDisplay = this._resolveColumn( ds, this.displayColumn, iUse );

            let src = ds;
            if ( this.sortColumn !== undefined || this.sortColumn !== null )
            {
                const iSort = this._resolveColumn( ds, this.sortColumn, iDisplay );
                if ( typeof ds.sort === "function" )
                {
                    src = ds.sort( iSort, this.sortAscending );
                }
            }

            // De-duplicate on the submitted value; first occurrence wins.
            const map = new Map();
            for ( let r = 0; r < src.rowCount; r++ )
            {
                const use = src.getCellValue( r, iUse );
                if ( use === null || use === undefined ) continue;

                const displayRaw = src.getFormattedCellValue( r, iDisplay );
                const display = ( displayRaw !== null && displayRaw !== undefined )
                    ? String( displayRaw )
                    : String( use );

                if ( !map.has( use ) )
                {
                    map.set( use, { use, display } );
                }
            }

            this.aOptions = Array.from( map.values() );
        }

        _restoreSelection( oControlHost )
        {
            this.aSelected = [];
            if ( !this.parameter || typeof oControlHost.getParameter !== "function" ) return;

            const raw = oControlHost.getParameter( this.parameter );
            const aValues = this._normalizeValues( raw );
            const set = new Set( aValues.map( v => v.use ) );

            this.aSelected = this.aOptions
                .filter( o => set.has( o.use ) )
                .map( o => ( { use: o.use, display: o.display } ) );
        }

        // Normalize whatever shape getParameter() returns into [{use, display}].
        _normalizeValues( raw )
        {
            if ( raw === null || raw === undefined ) return [];

            let arr = Array.isArray( raw ) ? raw : [ raw ];

            // Case: [ { parameter, values: [...] } ]
            if ( arr.length && arr[ 0 ] && Array.isArray( arr[ 0 ].values ) )
            {
                arr = arr[ 0 ].values;
            }

            return arr
                .map( v => {
                    if ( !v ) return null;
                    if ( v.start !== undefined )  // range parameter: take the start value
                    {
                        v = v.start;
                    }
                    const use = v.use;
                    const display = ( v.display !== undefined && v.display !== null ) ? v.display : use;
                    return { use, display: String( display ) };
                } )
                .filter( v => v && v.use !== undefined && v.use !== null );
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
                    const first = aKeywords[ 0 ];
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
            if ( !this.oDataStore )
            {
                return `<div style="padding:8px; color:#757575;">No dataset bound to this control.</div>`;
            }

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
            if ( !elSearch || !elList ) return;

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
                    : this.aSelected.concat( [ { use: opt.use, display: opt.display } ] );
            }
            else
            {
                this.aSelected = already ? [] : [ { use: opt.use, display: opt.display } ];
            }

            this._renderList();

            // Signal Cognos that the parameter value changed (enables Next/Finish,
            // and drives auto-submit where the report is configured for it).
            if ( this.oControlHost && typeof this.oControlHost.valueChanged === "function" )
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
                .map( ( o, i ) => ( { o, i } ) )
                .filter( x => this._matches( x.o.display, aKeywords ) );

            if ( aVisible.length === 0 )
            {
                elList.innerHTML = `<div style="padding:8px; color:#757575;">${this._escapeHtml( this.noResultsText )}</div>`;
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

        _toBool( v, bDefault )
        {
            if ( v === undefined || v === null || v === "" ) return bDefault;
            if ( typeof v === "boolean" ) return v;
            const s = String( v ).toLowerCase();
            if ( s === "true" ) return true;
            if ( s === "false" ) return false;
            return bDefault;
        }

        _parseConfig( oControlHost )
        {
            let cfg = oControlHost.configuration;
            if ( typeof cfg === "string" )
            {
                try { cfg = JSON.parse( cfg ); }
                catch ( e ) { cfg = {}; }
            }
            return cfg || {};
        }

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

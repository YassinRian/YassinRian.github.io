define(["jquery"], function ($) {
  "use strict";

  class UI {
    constructor(container, app) {
      this.$cnt = $(container);
      this.app = app; // Reference to app to access timeMachine
    }

renderSkeleton() {

const helpModalHtml = `
        <div id="help-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 9999; align-items: center; justify-content: center;">
            <div style="background: white; width: 550px; max-height: 85vh; border-radius: 12px; overflow-y: auto; padding: 35px; position: relative; box-shadow: 0 15px 40px rgba(0,0,0,0.3);">
                <span id="close-modal" style="position: absolute; top: 15px; right: 20px; cursor: pointer; font-size: 28px; color: #aaa;">&times;</span>
                
                <h2 style="margin-top: 0; color: #005fb8; border-bottom: 2px solid #f0f7ff; padding-bottom: 15px; font-size: 20px;">📘 Handleiding: Metadata Explorer</h2>
                
                <div style="font-size: 13.5px; line-height: 1.6; color: #444;">
                    <p><b>1. Zoeken:</b> Gebruik <code>::</code> voor meerdere termen (bijv. <i>klant :: adres</i>). De zoekbalk ondersteunt ook RegExp.</p>
                    <p><b>2. Pad-weergave:</b> Elk object toont het volledige FM-pad (klik op ... ): <i>Namespace > Folder > Tabel</i>.</p>
                    <p><b>3. Weergave wijzigingen:</b> Filter op wijzigingsdatum om recente updates in het model te identificeren.</p>
                    <p><b>4. SQL Export:</b> 
                        <ul style="margin: 5px 0; padding-left: 20px;">
                            <li><i>Standaard:</i> Bevat originele aliassen en voegt technische ID's toe.</li>
                            <li><i>Gepersonaliseerd:</i> Gebruik een <code>.txt</code> bestand (<code>oud|nieuw</code>) voor eigen aliassen.</li>
                        </ul>
                    </p>
                    <p><b>5. Sortering:</b> ID's staan altijd bovenaan en alles is gegroepeerd op de eerste 4 letters van de veldnaam.</p>
                </div>

                <button id="close-modal-btn" style="margin-top: 25px; width: 100%; padding: 12px; background: #005fb8; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px;">Begrepen</button>
            </div>
        </div>
    `;



    this.$cnt.html(`


<div class="cognos-extractor-wrapper" style="font-family: -apple-system, system-ui, sans-serif; padding: 20px; background: #fff; color: #333;">

            <div id="status-bar" style="background: #f0f7ff; padding: 12px 18px; border-radius: 4px; margin-bottom: 20px; border-left: 4px solid #005fb8; font-size: 13px; color: #004a91; display: flex; justify-content: space-between; align-items: center;">
                <span id="status-text">Klaar voor gebruik...</span>
                <button id="help-trigger" style="background: #005fb8; color: white; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; font-size: 14px; font-weight: bold; display: flex; align-items: center; justify-content: center; line-height: 1;" title="Handleiding tonen">i</button>
            </div>



   <div style="display: flex; gap: 10px; margin-bottom: 12px; height: 40px;">
      <div style="position: relative; width: 110px; flex-shrink: 0;">
         <button style="width: 100%; height: 100%; border: 1px solid #ccc; background: #fff; border-radius: 4px; font-size: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">
         📂 Kies XML
         </button>
         <input type="file" id="xml-upload" accept=".xml" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;" />
      </div>
      <input type="text" id="search-box" placeholder="Zoek gegevens op (gebruik :: voor incrementeel zoeken)..."
         style="flex-grow: 1; height: 100%; padding: 0 15px; border: 1px solid #ccc; border-radius: 4px; font-size: 13px; outline: none; box-sizing: border-box;" />
      <div class="export-dropdown-container" style="position: relative; width: 200px;">
         <button id="export-main-btn" style="width: 100%; height: 100%; background: #005fb8; color: white; border: none; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
         📥 Export Modellaag <span style="font-size: 8px;">▼</span>
         </button>
         <div id="export-menu" style="display: none; position: absolute; top: 42px; right: 0; background: white; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; width: 240px; overflow: hidden;">
            <div id="export-tech-sql" class="dropdown-item" style="padding: 12px 15px; cursor: pointer; border-bottom: 1px solid #eee; transition: background 0.2s;">
               <div style="font-weight: 600; font-size: 12px; color: #333;">Standaard SQL Export</div>
               <div style="font-size: 10px; color: #666;">Inclusief technische ID's uit Datalaag.</div>
            </div>
            <div style="padding: 15px; background: #fafafa; border-bottom: 1px solid #eee;">
               <div style="font-weight: 600; font-size: 11px; color: #005fb8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Gepersonaliseerde SQL</div>
               <div style="position: relative; margin-bottom: 10px;">
                  <button style="width: 100%; padding: 6px; font-size: 10px; background: white; border: 1px dotted #005fb8; border-radius: 4px; cursor: pointer; color: #005fb8; font-weight: 600;">
                  🔗 Koppel Alias Map (.txt)
                  </button>
                  <input type="file" id="alias-map-upload" accept=".txt" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;" />
               </div>
               <div id="export-custom-sql" class="dropdown-item" style="padding: 10px; text-align: center; background: #28a745; color: white; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 4px rgba(40,167,69,0.2);">
                  Exporteer met eigen Aliassen
               </div>
               <div style="font-size: 9px; color: #888; margin-top: 6px; text-align: center; font-style: italic;">
                  Onbekende objecten krijgen [VERVANG]
               </div>
            </div>
         </div>
      </div>
   </div>
   <div style="display: flex; align-items: center; justify-content: space-between; margin: 20px 0px 20px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
      <div id="layer-tabs" style="display: flex; gap: 8px;">
         <button class="layer-tab active" data-layer="all">Alles</button>
         <button class="layer-tab" data-layer="Data">Datalaag</button>
         <button class="layer-tab" data-layer="Model">Modellaag</button>
      </div>
      <div class="time-travel-panel" style="display: flex; align-items: center; gap: 10px; padding: 4px 12px; background: #fafafa; border: 1px solid #ddd; border-radius: 4px; height: 32px; box-sizing: border-box;">
         <span style="font-size: 10px; font-weight: 800; color: #005fb8; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap;">🕒 Laatst Gewijzigd</span>
         <select id="time-range-select" style="border: none; background: transparent; font-size: 12px; color: #555; cursor: pointer; outline: none;">
            <option value="all">Volledige historie</option>
            <option value="1">Laatste 24 uur</option>
            <option value="7">Laatste 7 dagen</option>
            <option value="30">Laatste 30 dagen</option>
            <option value="365">Laatste jaar (Archief)</option>
         </select>
      </div>
   </div>
   <div id="data-preview"></div>

   ${helpModalHtml}
</div>



    `);
}


    updateStatus(msg) {
      this.$cnt.find("#status-text").text(msg);
    }

    displayModel(tables, append = false) {
      const $preview = this.$cnt.find("#data-preview");
      const searchTerm = $("#search-box").val() || "";

      if (!append) $preview.empty();

      tables.forEach((table) => {
        let sqlContent = "";

        if (table.layer === "Model") {
          sqlContent = this.generateVirtualSQL(table);
        } else {
          sqlContent = table.sql && table.sql.length > 5 ? table.sql : "/* Geen SQL bron gevonden in Datalaag */";
        }

        const highlightedSQL = this.highlightSQL(sqlContent);
        const searchHighlightedSQL = this.highlightText(highlightedSQL, searchTerm);

        // --- TIME TRAVEL LOGIC FOR TABLE ---
        const isTableModified = this.app.timeMachine.isModified(table.lastModified);
        const tableRecentBadge = isTableModified
          ? `<span class="modified-indicator" title="Gewijzigd op: ${table.lastModified.toLocaleString()} door ${table.modifiedBy}">MODIFIED</span>`
          : "";

        // --- TIME TRAVEL LOGIC FOR COLUMNS ---
        const columnList = table.columns
          .map((col) => {
            const hName = this.highlightText(col.name, searchTerm);
            const isColModified = this.app.timeMachine.isModified(col.lastModified);

            // Gebruik oranje badge als de kolom recent gewijzigd is
            const badgeClass = isColModified ? "column-badge-modified" : "column-badge";
            const tooltip = isColModified
              ? `title="Gewijzigd op: ${col.lastModified.toLocaleString()} door ${col.modifiedBy}"`
              : "";

            return `<span class="${badgeClass}" ${tooltip}>${hName}</span>`;
          })
          .join("");

        //const technicalSQL = (table.layer === "Model") ? this.generateTechnicalExportSQL(table) : null;

        const html = `
        <div class="card">
   <div class="card-header">
      <div class="breadcrumb-wrapper" title="Klik om het volledige pad te zien/verbergen">
         <span style="color: #ffc107; margin-right: 5px; flex-shrink: 0;">📂</span>
         <div class="path-collapsed" style="display: flex; align-items: center; overflow: hidden;">
            <span class="path-ellipsis">...</span>
            <span class="folder-path" style="margin-left: 5px;">${this.highlightText(table.parentFolder, searchTerm)}</span>
         </div>
         <div class="path-expanded" style="display: none; overflow: hidden;">
            <span class="full-path-display">${this.highlightText(table.fullPath, searchTerm)}</span>
         </div>
         <span style="color: #ccc; margin: 0 8px; flex-shrink: 0;">/</span>
         <strong class="table-name" style="color: #333; flex-shrink: 0;">
         ${this.highlightText(table.name, searchTerm)}
         </strong>
         ${tableRecentBadge}
      </div>
      <div class="btn-group">
         <button class="toggle-view active" data-view="grid">📊 Grid</button>
         <button class="toggle-view" data-view="sql">⌨️ SQL</button>
      </div>
   </div>
   <div class="view-content grid-view" style="padding: 15px;">
      ${columnList}
   </div>
   <div class="view-content sql-view" style="padding: 0; display: none; position: relative;">
      <button class="copy-sql-btn">Copy SQL</button>
      <div class="sql-container clickable-sql" title="Click to toggle highlighting" data-highlight="on">
         <pre class="sql-block highlighted-version">${searchHighlightedSQL}</pre>
         <pre class="sql-block clean-version" style="display:none;">${highlightedSQL}</pre>
      </div>
   </div>
</div>
`;


        $preview.append(html);
      });
    }

    highlightSQL(sql) {
      if (!sql) return "";

      // 1. Escapen voor veiligheid
      let html = sql
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // 2. Keywords (SELECT, FROM, WHERE, etc.)
      const keywords =
        /\b(SELECT|FROM|WHERE|JOIN|LEFT|INNER|ON|AND|OR|GROUP BY|ORDER BY|CASE|WHEN|THEN|ELSE|END|AS|IN|NOT|NULL|DISTINCT)\b/gi;
      html = html.replace(keywords, '<span class="sql-keyword">$1</span>');

      // 3. Brackets [Table].[Column]
      html = html.replace(/(\[.*?\])/g, '<span class="sql-bracket">$1</span>');

      // 4. Strings 'text'
      html = html.replace(/('.*?')/g, '<span class="sql-string">$1</span>');

      // 5. Functies COUNT(), SUM(), etc.
      html = html.replace(
        /\b(COUNT|SUM|AVG|MIN|MAX|CAST|CONVERT|COALESCE)\b/gi,
        '<span class="sql-function">$1</span>',
      );

      return html;
    }

    highlightText(text, term) {
      if (!text || !term || term.length < 2) return text;

      const parts = term
        .split("::")
        .map((p) => p.trim())
        .filter((p) => p.length >= 2);
      let highlightedText = text;

      parts.forEach((part, index) => {
        const colorClass = `match-${index % 5}`;
        let regex;

        try {
          // PROBEER: Gebruik de term direct als Regex (voor ^, $, |, etc.)
          // We wrappen het in haakjes () zodat we $1 kunnen gebruiken voor de match
          regex = new RegExp(`(${part})`, "gi");
        } catch (e) {
          // FALLBACK: Als de Regex ongeldig is (bijv. een losse [ ),
          // dan ontsnappen we de tekens en zoeken we letterlijk.
          regex = new RegExp(`(${this.escapeRegExp(part)})`, "gi");
        }

        // Gebruik $1 om de exact gevonden tekst (met behoud van casing) terug te zetten
        highlightedText = highlightedText.replace(
          regex,
          `<span class="search-match ${colorClass}">$1</span>`,
        );
      });

      return highlightedText;
    }

    // Hulpmiddel om speciale tekens in de zoekterm te ontsnappen (zoals . of *)
    escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }


    generateVirtualSQL(table) {
      if (!table.columns || table.columns.length === 0) return "-- Geen kolommen gevonden --";

      let rawLines = [];
      let physicalTable = "BRONTABEL";
      let aliasName = "ALIAS";

      table.columns.forEach((col) => {
        const lineage = col.lineage || [];
        const aliasMatch = lineage[0]?.match(/\[.*?\]\.\[(.*?)\]/);
        const sourceMatch = lineage[lineage.length - 1]?.match(/\[.*?\]\.\[(.*?)\]\.\[(.*?)\]/);

        if (sourceMatch && aliasMatch) {
          physicalTable = sourceMatch[1];
          aliasName = aliasMatch[1];
          const sourcePart = `${aliasName}.${sourceMatch[2]}`;
          rawLines.push({ source: sourcePart, alias: `"${col.name}"` });
        }
      });

      if (rawLines.length === 0) return "-- Geen lineage data beschikbaar --";

      const maxLength = Math.max(...rawLines.map((l) => l.source.length));

      const selectLines = rawLines.map((line, index) => {
        const prefix = index === 0 ? " " : ",";
        const padding = " ".repeat(maxLength - line.source.length);
        return `${prefix}${line.source}${padding} AS ${line.alias}`;
      });

      return `SELECT\n${selectLines.join("\n")}\nFROM ${physicalTable} ${aliasName}`;
    }


generateTechnicalExportSQL(table, aliasMap = null) {
    let businessLines = this.getRawLineageLines(table);
    if (businessLines.length === 0) return null;

    const physicalTableName = businessLines[0].physicalTable;
    const originalAlias = businessLines[0].aliasName;
    
    let finalAlias = originalAlias;
    if (aliasMap !== null) {
        finalAlias = aliasMap[originalAlias.toLowerCase()] || "[VERVANG]";
    }

    let idLines = [];       
    let attributeLines = []; 

    // 1. TECHNISCHE ID'S UIT DATALAAG
    const dataLayerTable = this.app.allData.find(t => t.layer === "Data" && t.name === physicalTableName);
    if (dataLayerTable) {
        dataLayerTable.columns.forEach(col => {
            const isID = col.name.toUpperCase().includes("_ID");
            const alreadyInModel = businessLines.some(l => {
                const parts = l.source.split('.');
                return parts[parts.length - 1].toLowerCase() === col.name.toLowerCase();
            });

            if (isID && !alreadyInModel) {
                idLines.push({ 
                    source: `${finalAlias}.${col.name}`, 
                    alias: `"${col.name}"`,
                    sortKey: col.name.toUpperCase() // We bewaren de naam voor sortering
                });
            }
        });
    }

    // 2. BUSINESS KOLOMMEN
    businessLines.forEach(line => {
        const parts = line.source.split('.');
        const cleanColumnName = parts[parts.length - 1];
        const isID = cleanColumnName.toUpperCase().includes("_ID");

        const lineObj = {
            source: `${finalAlias}.${cleanColumnName}`,
            alias: line.alias,
            sortKey: cleanColumnName.toUpperCase()
        };

        if (isID) {
            idLines.push(lineObj);
        } else {
            attributeLines.push(lineObj);
        }
    });

    // 3. SORTEREN OP DE EERSTE 4 KARAKTERS
    const sortByFirstFour = (a, b) => {
        const keyA = a.sortKey.substring(0, 4);
        const keyB = b.sortKey.substring(0, 4);
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    };

    idLines.sort(sortByFirstFour);
    attributeLines.sort(sortByFirstFour);

    // 4. COMBINEER: Eerst de gesorteerde ID's, dan de gesorteerde attributen
    const finalLines = [...idLines, ...attributeLines];

    let sql = this.formatSQLLines(finalLines, physicalTableName, finalAlias);
    
    if (finalAlias === "[VERVANG]") {
        sql = `-- ATTENTIE: Geen alias mapping gevonden voor '${originalAlias}'.\n` + sql;
    }

    return sql;
}


getRawLineageLines(table) {
    let lines = [];
    table.columns.forEach((col) => {
        const lineage = col.lineage || [];
        // Regex om [Map].[Tabel].[Kolom] te vangen
        const sourceMatch = lineage[lineage.length - 1]?.match(/\[.*?\]\.\[(.*?)\]\.\[(.*?)\]/);
        const aliasMatch = lineage[0]?.match(/\[.*?\]\.\[(.*?)\]/);

        if (sourceMatch && aliasMatch) {
            lines.push({
                source: `${aliasMatch[1]}.${sourceMatch[2]}`, // Dit is de 'vuile' source
                alias: `"${col.name}"`,
                physicalTable: sourceMatch[1],
                aliasName: aliasMatch[1]
            });
        }
    });
    return lines;
}

formatSQLLines(rawLines, physicalTable, aliasName) {
    if (rawLines.length === 0) return "";
    const maxLength = Math.max(...rawLines.map(l => l.source.length));

    const selectLines = rawLines.map((line, index) => {
        const prefix = (index === 0) ? " " : ",";
        const padding = " ".repeat(maxLength - line.source.length);
        return `${prefix}${line.source}${padding} AS ${line.alias}`;
    });

    // Gebruik de aliasName (finalAlias) ook hier achter de tabelnaam
    return `SELECT\n${selectLines.join("\n")}\nFROM ${physicalTable} ${aliasName}`;
}


  }
  return UI;
});
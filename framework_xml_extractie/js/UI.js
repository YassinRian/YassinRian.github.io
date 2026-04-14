define(["jquery"], function ($) {
        "use strict";

        class UI {
                constructor(container) {
                        this.$cnt = $(container);
                }

                renderSkeleton() {
                        this.$cnt.html
                                (`
                        <div class="cognos-extractor-wrapper" style="font-family: sans-serif; padding: 15px;">
                            <div id="status-bar" style="background: #f8f9fa; padding: 10px; border-radius: 4px; margin-bottom: 15px; border-left: 4px solid #005fb8;">
                                Ready to load model...
                            </div>

                            <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 20px;">
                                <input type="file" id="xml-upload" accept=".xml" />
                                <input type="text" id="search-box" placeholder="Zoek tabellen of kolommen..."
                                       style="flex-grow: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
                        </div>

                        <div id="layer-tabs" style="display: flex; gap: 5px; margin-bottom: 15px;">
                                <button class="layer-tab active" data-layer="all">Alles</button>
                                <button class="layer-tab" data-layer="Data">Datalaag</button>
                                <button class="layer-tab" data-layer="Model">Modellaag</button>
                        </div>
                            <div id="data-preview"></div>

                            <div id="pagination-controls" style="margin-top: 20px; text-align: center; display: none;">
                                <button id="load-more" style="padding: 10px 20px; cursor: pointer; background: #005fb8; color: white; border: none; border-radius: 4px;">
                                    Load More Results
                                </button>
                            </div>
                        </div>
                         `);
                }

                updateStatus(msg) {
                        this.$cnt.find("#status-bar").text(msg);
                }

                displayModel(tables, append = false) {
                        // Add 'append = false' here
                        const $preview = this.$cnt.find("#data-preview");

                        // We halen de huidige waarde van de zoekbalk op
                        const searchTerm = $("#search-box").val() || "";
                        const totalCount = tables.length; // Dit is de gefilterde lijst

                        const breadcrumb = searchTerm.replace(/::/g, ' <span style="color:#005fb8">➔</span> ');

                        // Update een teller in de skeleton (voeg deze div toe aan renderSkeleton)
                        this.$cnt.find("#status-bar").html(`
                        Gevonden: <strong>${totalCount}</strong> resultaten 
                        ${searchTerm ? `voor "${searchTerm.replace(/::/g, ' ➔ ')}"` : ''}
                        `);

                        // Als we niet 'bijplakken', maken we de lijst eerst leeg
                        if (!append) $preview.empty();

                        // Check of er resultaten zijn
                        if (tables.length === 0 && !append) {
                                $preview.html(
                                        "<p style='color: #666;'>Geen resultaat gevonden voor ingevoerde zoekterm.</p>",
                                );
                                return; // Stop de functie hier
                        }

                        tables.forEach(table => {
                                const badgeColor = table.layer === 'Data' ? '#4caf50' : '#ff9800';

                                // 1. Highlight the Folder and Table Name
                                const highlightedFolderName = this.highlightText(table.folder, searchTerm);
                                const highlightedTableName = this.highlightText(table.name, searchTerm);

                                const folderPrefix = table.folder
                                        ? `<span style="opacity: 0.7; font-weight: normal; font-size: 0.9em;">${highlightedFolderName} / </span>`
                                        : "";

                                // 2. Highlight the Columns
                                const columnList = table.columns.map(col => {
                                        const highlightedCol = this.highlightText(col, searchTerm);
                                        return `<span style="display:inline-block; background:#ddd; padding:2px 8px; margin:2px; border-radius:4px; font-family:sans-serif; font-size:11px;">${highlightedCol}</span>`;
                                }).join("");

                                // 3. Highlight the SQL (Optional, but very helpful!)
                                const highlightedSQL = this.highlightSQL(table.sql);
                                // We do a second pass on the highlighted SQL to catch search terms
                                const finalSQL = this.highlightText(highlightedSQL, searchTerm);

                                const html = `
                                        <div style="margin-top:20px; border:1px solid #005fb8; border-radius:5px; position:relative;">
                                                <div style="background:#005fb8; color:white; padding:8px 12px; display:flex; justify-content:space-between; align-items:center;">
                                                <div style="display: flex; align-items: center; gap: 5px;">
                                                        <span>📂</span>
                                                        <span style="font-weight:bold;">${folderPrefix}${highlightedTableName}</span>
                                                </div>
                                                <span style="background:${badgeColor}; ...">${table.layer}</span>
                                                </div>
                                                <div style="padding:15px; background: white;">
                                                        <pre style="background:#1e1e1e; color: #d4d4d4; padding:12px; border:1px solid #333; border-radius:3px; white-space:pre-wrap; font-size:12px; font-family: 'Consolas', 'Monaco', monospace; overflow-x: auto;">${finalSQL}</pre>
                                                        <div style="margin-top:12px;">${columnList}</div>
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
                        html = html.replace(
                                keywords,
                                '<span class="sql-keyword">$1</span>',
                        );

                        // 3. Brackets [Table].[Column]
                        html = html.replace(
                                /(\[.*?\])/g,
                                '<span class="sql-bracket">$1</span>',
                        );

                        // 4. Strings 'text'
                        html = html.replace(
                                /('.*?')/g,
                                '<span class="sql-string">$1</span>',
                        );

                        // 5. Functies COUNT(), SUM(), etc.
                        html = html.replace(
                                /\b(COUNT|SUM|AVG|MIN|MAX|CAST|CONVERT|COALESCE)\b/gi,
                                '<span class="sql-function">$1</span>',
                        );

                        return html;
                }


                highlightText(text, term) {
                        if (!text || !term || term.length < 2) return text;

                        const parts = term.split('::').map(p => p.trim()).filter(p => p.length >= 2);
                        let highlightedText = text;

                        parts.forEach((part, index) => {
                                const colorClass = `match-${index % 5}`;
                                let regex;

                                try {
                                        // PROBEER: Gebruik de term direct als Regex (voor ^, $, |, etc.)
                                        // We wrappen het in haakjes () zodat we $1 kunnen gebruiken voor de match
                                        regex = new RegExp(`(${part})`, 'gi');
                                } catch (e) {
                                        // FALLBACK: Als de Regex ongeldig is (bijv. een losse [ ), 
                                        // dan ontsnappen we de tekens en zoeken we letterlijk.
                                        regex = new RegExp(`(${this.escapeRegExp(part)})`, 'gi');
                                }

                                // Gebruik $1 om de exact gevonden tekst (met behoud van casing) terug te zetten
                                highlightedText = highlightedText.replace(regex, `<span class="search-match ${colorClass}">$1</span>`);
                        });

                        return highlightedText;
                }

                // Hulpmiddel om speciale tekens in de zoekterm te ontsnappen (zoals . of *)
                escapeRegExp(string) {
                        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                }



                // this is the end of the class
        }
        return UI;
});

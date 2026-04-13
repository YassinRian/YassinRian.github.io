define(["jquery"], function($) {
    "use strict";

    class UI {
        constructor(container) {
            this.$cnt = $(container);
        }

        renderSkeleton() {
            this.$cnt.html
            (`
              <div class="cognos-custom-control">
                <input type="file" id="xml-upload" accept=".xml"/>
                <div id="status-bar">Bestand wordt geladen...</div>
                <hr/>
                <div id="data-preview"></div>
              </div>
            `)
        }

        updateStatus(msg) {
            this.$cnt.find("#status-bar").text(msg);
        }

        displayModel(tables) {
            const $preview = this.$cnt.find("#data-preview");

            $preview.empty();

            tables.forEach(table => {
                const columnList = table.columns.map(col =>
                    `<span style="display:inline-block; background:#ddd; padding:2px 8px; margin:2px; border-radius:4px; font-family:sans-serif;">${col}</span>`
                ).join("");

                const html = `
                    <div style="margin-top:20px; border:1px solid #005fb8; border-radius:5px;">
                        <div style="background:#005fb8; color:white; padding:8px;">${table.name}</div>
                        <div style="padding:15px;">
                            <pre style="background:#f4f4f4; padding:10px; border:1px solid #ccc; white-space:pre-wrap;">${table.sql}</pre>
                            <div style="margin-top:10px;">${columnList}</div>
                        </div>
                    </div>
                `;
                $preview.append(html);
            });
        }

        // this is the end of the class
    }
    return UI;
});

define([], function() {
    "use strict";

    class Extractor {
        constructor() {
            this.xmlDoc = null;
        }

        async parseFile(file) {
            const text = await file.text();
            this.xmlDoc = new DOMParser().parseFromString(text, "text/xml");
            if (this.xmlDoc.getElementsByTagName("parsererror").length > 0) {
                throw new Error("Ongeldige XML formaat");
            }
            return this.xmlDoc;
        }

        // Helper for Namespace-agnostic tag selection
        ln(name) {
            return `*[local-name()='${name}']`;
        }

        // Generic query method for snapshots
        query(xpath, context = this.xmlDoc) {
            const res = this.xmlDoc.evaluate(xpath, context, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            let nodes = [];
            for (let i = 0; i < res.snapshotLength; i++) {
                nodes.push(res.snapshotItem(i));
            }
            return nodes;
        }

        /**
         * Generic Scoped Extraction
         * @param {string} layerName - e.g., 'Datalaag', 'Modellaag'
         */
        getLayerData(layerName) {
            const ln = this.ln;
            const scopePath = `//*[local-name()='namespace'][${ln('name')}='${layerName}']`;
            const scopeNode = this.xmlDoc.evaluate(scopePath, this.xmlDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

            if (!scopeNode) return [];

            return this.query(`.//${ln('querySubject')}`, scopeNode).map(qs => {
                const nameNode = this.xmlDoc.evaluate(`./${ln('name')}`, qs, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                const sqlNode = this.xmlDoc.evaluate(`.//${ln('sql')}`, qs, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                const columnNodes = this.query(`.//${ln('queryItem')}/${ln('name')}`, qs);

                return {
                    name: nameNode ? nameNode.textContent : "Onbekend",
                    sql: sqlNode ? sqlNode.textContent.trim() : "Geen SQL gevonden",
                    columns: columnNodes.map(n => n.textContent)
                };
            });
        }
    }

    return Extractor;
});

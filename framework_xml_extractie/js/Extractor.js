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
                        const res = this.xmlDoc.evaluate(
                                xpath,
                                context,
                                null,
                                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                                null,
                        );
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
    // 1. Zoek de namespace (bijv. 'Modellaag')
    const scopePath = `//*[local-name()='namespace'][${ln('name')}='${layerName}']`;
    const scopeNode = this.xmlDoc.evaluate(scopePath, this.xmlDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  

    if (!scopeNode) {
        console.error("Namespace niet gevonden:", layerName);
        return [];
    }

    // 2. Vind alle querySubjects binnen deze namespace, hoe diep ze ook zitten
    const subjects = this.query(`.//${ln('querySubject')}`, scopeNode);

    return subjects.map(qs => {
        // Haal QuerySubject metadata op
        const tableModified = this.xmlDoc.evaluate(`./${ln('lastChanged')}`, qs, null, XPathResult.STRING_TYPE, null).stringValue;
        const tableUser = this.xmlDoc.evaluate(`./${ln('lastChangedBy')}`, qs, null, XPathResult.STRING_TYPE, null).stringValue;

        const columnNodes = this.query(`.//${ln('queryItem')}`, qs);
        const columns = columnNodes.map(item => {
            // Haal QueryItem metadata op
            const colModified = this.xmlDoc.evaluate(`./${ln('lastChanged')}`, item, null, XPathResult.STRING_TYPE, null).stringValue;
            const colUser = this.xmlDoc.evaluate(`./${ln('lastChangedBy')}`, item, null, XPathResult.STRING_TYPE, null).stringValue;

            return {
                name: this.xmlDoc.evaluate(`./${ln('name')}`, item, null, XPathResult.STRING_TYPE, null).stringValue,
                lineage: this.query(`.//${ln('refobj')}`, item).map(r => r.textContent),
                // NIEUW: Metadata voor de kolom
                lastModified: colModified ? new Date(colModified.replace(' ', 'T')) : null,
                modifiedBy: colUser
            };
        });

       // 4. Full Path / Breadcrumb Extractie (Klim omhoog tot de namespace)

        let pathParts = [];
        let parent = qs.parentNode;

        while (parent) {
            // We pakken alles wat een 'name' heeft: folders, namespaces, en het project (root)
            if (parent.localName === 'folder' || parent.localName === 'namespace' || parent.localName === 'project') {
                const partName = this.xmlDoc.evaluate(`./${ln('name')}`, parent, null, XPathResult.STRING_TYPE, null).stringValue;
                if (partName) {
                    // unshift voegt het item aan het BEGIN van de array toe
                    // Dus: [Algemeen] -> [Datalaag, Algemeen] -> [CRN_OBC, Datalaag, Algemeen]
                    pathParts.unshift(partName); 
                }
            }
            parent = parent.parentNode;
        }

        const fullPath = pathParts.join(' / ');
        // De 'Parent Folder' is de laatste in de lijst (bijv. Algemeen)
        const parentFolder = pathParts.length > 0 ? pathParts[pathParts.length - 1] : "Root";
                
        // 5. SQL Extractie (Bestand alleen in de Datalaag)
        const sql = this.xmlDoc.evaluate(`.//${ln('sql')}`, qs, null, XPathResult.STRING_TYPE, null).stringValue.trim();

        return {
            name: this.xmlDoc.evaluate(`./${ln('name')}`, qs, null, XPathResult.STRING_TYPE, null).stringValue,
            fullPath: fullPath,
            parentFolder: parentFolder,
            sql,
            columns,
            lastModified: tableModified ? new Date(tableModified.replace(' ', 'T')) : null,
            modifiedBy: tableUser,
            layer: layerName // Wordt later in App.js overschreven naar 'Data'/'Model'
        };
    });
}





        // eind class

        }

        return Extractor;
});

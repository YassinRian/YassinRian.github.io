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
    console.log(`Found ${subjects.length} subjects in ${layerName}`);

    return subjects.map(qs => {
        // Naam van de tabel/subject
        const name = this.xmlDoc.evaluate(`./${ln('name')}`, qs, null, XPathResult.STRING_TYPE, null).stringValue;

        // 3. Lineage/Kolom extractie
        const columnNodes = this.query(`.//${ln('queryItem')}`, qs);
        const columns = columnNodes.map(item => {
            const colName = this.xmlDoc.evaluate(`./${ln('name')}`, item, null, XPathResult.STRING_TYPE, null).stringValue;
            // Haal alle refobj paden op voor de lineage
            const refObjs = this.query(`.//${ln('refobj')}`, item).map(r => r.textContent);

            return {
                name: colName,
                lineage: refObjs
            };
        });

       // 4. Full Path / Breadcrumb Extractie (Klim omhoog tot de namespace)

        let pathParts = [];
        let parent = qs.parentNode;

        while (parent && parent.localName !== 'namespace') {
            if (parent.localName === 'folder') {
                const folderName = this.xmlDoc.evaluate(`./${ln('name')}`, parent, null, XPathResult.STRING_TYPE, null).stringValue;
                if (folderName) {
                    pathParts.unshift(folderName); // Voeg vooraan toe om de juiste volgorde te houden
                }
            }
            parent = parent.parentNode;
        }

        // Combineer de folders met een separator
        const fullFolderPath = pathParts.length > 0 ? pathParts.join(' / ') : "Root";

        // 5. SQL Extractie (Bestand alleen in de Datalaag)
        const sql = this.xmlDoc.evaluate(`.//${ln('sql')}`, qs, null, XPathResult.STRING_TYPE, null).stringValue.trim();

        return {
            name,
            folder: fullFolderPath,
            sql,
            columns,
            layer: layerName // Wordt later in App.js overschreven naar 'Data'/'Model'
        };
    });
}





        // eind class

        }

        return Extractor;
});

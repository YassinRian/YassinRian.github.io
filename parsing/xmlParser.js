define(function() {
    return {
        parseXML: function(xmlString) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "application/xml");

            // Extracting dataItem names and expressions
            const dataItems = xmlDoc.querySelectorAll('dataItem');
            let data = [];

            dataItems.forEach(item => {
                const name = item.getAttribute('name');
                const expression = item.querySelector('expression').textContent;
                data.push({ name: name, expression: expression });
            });

            return data;
        }
    };
});
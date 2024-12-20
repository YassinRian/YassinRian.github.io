define(function() {
    return {
        getDataItems: function(xmlString) {
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
        },
        getQueries: function(xmlString) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "application/xml");
            const queries = xmlDoc.querySelectorAll('query');

            let queryData = [];
            queries.forEach(query => {
                const queryName = query.getAttribute('name');
                const dataItems = query.querySelectorAll('dataItem');
                let items = [];
    
                dataItems.forEach(item => {
                    const name = item.getAttribute('name');
                    const label = item.getAttribute('label');
                    const expression = item.querySelector('expression')?.textContent;
                    items.push({ name, label, expression });
                });
    
                queryData.push({ queryName, dataItems: items });
            });
            return queryData;
        },
        getLists: function(xmlString) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "application/xml");
            const lists = xmlDoc.querySelectorAll('list');
    
            let listData = [];
            lists.forEach(list => {
                const refQuery = list.getAttribute('refQuery');
                const name = list.getAttribute('name');
                const dataItemLabels = list.querySelectorAll('dataItemLabel');
    
                let refDataItems = [];
                dataItemLabels.forEach(label => {
                    const refDataItem = label.getAttribute('refDataItem');
                    refDataItems.push(refDataItem);
                });
    
                listData.push({ refQuery, name, refDataItems });
            });
    
            return listData;
        },
        getDetailFilters: function(xmlString) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "application/xml");
            const queries = xmlDoc.querySelectorAll('query');
    
            let filterData = [];
            queries.forEach(query => {
                const queryName = query.getAttribute('name');
                const filterExpression = query.querySelector('filterExpression')?.textContent;
    
                if (filterExpression) {
                    filterData.push({ queryName, filterExpression });
                }
            });
            return filterData;
        },
        addLabelsToList: function(listData, queryData) {
            listData.forEach(list => {
                list.refDataItems = list.refDataItems.map(refDataItem => {
                    const query = queryData.find(q => q.queryName === list.refQuery);
                        if (query) {
                        const dataItem = query.dataItems.find(item => item.name === refDataItem);
                        if (dataItem) {
                            return { refDataItem, label: dataItem.label };
                        }
                    }
                        return { refDataItem, label: null };
                });
            });
            return listData;
        }
    };
});
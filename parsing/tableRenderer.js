define(['jquery'], function($) {
    return {
        renderTable: function(data, container, type) {
            const tableContainer = $(container);
            tableContainer.empty(); // Clear previous content

            // Create the table with dynamic headers
            const table = $('<table id="dataTable"></table>');
            table.append(`
                <thead>
                    <tr>
                        <th>${type === 'Queries' ? 'Query Name' : 'Name'}</th>
                        ${type === 'Queries' ? '<th>Label</th>' : ''}
                        ${type === 'Detail Filters' ? '<th>Filter Expression</th>' : ''}
                        ${type === 'Lists' ? '<th>Ref Query</th><th>Data Items</th>' : ''}
                        ${type !== 'Detail Filters' && type !== 'Lists' ? '<th>Expression</th>' : ''}
                    </tr>
                </thead>
                <tbody></tbody>
            `);

            // Populate the table rows with data
            const tbody = table.find('tbody');
            data.forEach(row => {
                const tr = $('<tr></tr>');

                // Handle dynamic row rendering based on type
                if (type === 'Queries') {
                    tr.append(`<td>${row.queryName}</td>`);
                    tr.append(`<td>${row.label || ''}</td>`);
                    tr.append(`<td>${row.expression || ''}</td>`);
                } else if (type === 'Lists') {
                    tr.append(`<td>${row.name}</td>`);
                    tr.append(`<td>${row.refQuery}</td>`);
                    tr.append(`<td>${row.refDataItems.map(item => `${item.refDataItem} (${item.label || ''})`).join(', ')}</td>`);
                } else if (type === 'Detail Filters') {
                    tr.append(`<td>${row.queryName}</td>`);
                    tr.append(`<td>${row.filterExpression}</td>`);
                } else {
                    // Default case for other data structures
                    tr.append(`<td>${row.name}</td>`);
                    tr.append(`<td>${row.expression || ''}</td>`);
                }

                tbody.append(tr);
            });

            // Add table to the container
            tableContainer.append(table);

            // Add search input field
            const searchInput = $(`
                <div>
                    <input id="searchInput" type="text" placeholder="Enter regex to search..." />
                    <label>
                        <input type="checkbox" id="regexToggle" />
                        Use Regular Expression
                    </label>
                </div>
            `);
            tableContainer.prepend(searchInput);

            // Search functionality
            searchInput.on('input', function() {
                const query = $('#searchInput').val();
                searchTable(query, type);
            });
        }
    };

    function searchTable(query, type) {
        try {
            const isRegex = $('#regexToggle').is(':checked');
            const regex = isRegex ? new RegExp(query, 'i') : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

            const rows = $('#dataTable tbody tr');
            rows.each(function() {
                const cells = $(this).find('td');
                let match = false;

                if (type === 'Queries') {
                    match = regex.test(cells.eq(0).text()) || regex.test(cells.eq(1).text()) || regex.test(cells.eq(2).text());
                } else if (type === 'Lists') {
                    match = regex.test(cells.eq(0).text()) || regex.test(cells.eq(1).text()) || regex.test(cells.eq(2).text());
                } else if (type === 'Detail Filters') {
                    match = regex.test(cells.eq(0).text()) || regex.test(cells.eq(1).text());
                } else {
                    match = regex.test(cells.eq(0).text()) || regex.test(cells.eq(1).text());
                }

                if (match) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        } catch (e) {
            console.error('Invalid regex:', e);
        }
    }
});

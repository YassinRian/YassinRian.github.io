define(['jquery'], function($) {
    return {
        renderTable: function(data, container) {
            const tableContainer = $(container);
            tableContainer.empty(); // Clear previous content

            // Create the table
            const table = $('<table id="dataTable"></table>');
            table.append(`
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Expression</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `);

            // Populate the table rows with data
            const tbody = table.find('tbody');
            data.forEach(row => {
                const tr = $('<tr></tr>');
                tr.append(`<td>${row.name}</td><td>${row.expression}</td>`);
                tbody.append(tr);
            });

            // Add table to the container
            tableContainer.append(table);

            // Add search input field
            const searchInput = $('<input id="searchInput" type="text" placeholder="Enter regex to search..." />');
            tableContainer.prepend(searchInput);

            // Search functionality
            searchInput.on('input', function() {
                const query = $(this).val();
                searchTable(query, data);
            });
        }
    };

    // Search table rows based on regex
    // function searchTable(query, data) {
    //     const regex = new RegExp(query, 'i');
    //     const rows = $('#dataTable tbody tr');

    //     rows.each(function() {
    //         const nameCell = $(this).find('td').eq(0).text();
    //         const expressionCell = $(this).find('td').eq(1).text();
    //         const match = regex.test(nameCell) || regex.test(expressionCell);

    //         if (match) {
    //             $(this).show();
    //         } else {
    //             $(this).hide();
    //         }
    //     });
    // }
// Search table rows based on regex
    function searchTable(query, data) {
        try {   
            // Escape special regex characters in the query
            const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(safeQuery, 'i');
            const rows = $('#dataTable tbody tr');

            rows.each(function() {
                const nameCell = $(this).find('td').eq(0).text();
                const expressionCell = $(this).find('td').eq(1).text();
                const match = regex.test(nameCell) || regex.test(expressionCell);

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
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
    }; // einde rendererTable func

    function searchTable(query, data) {
          try {
            // Determine if the query is a regex or literal search
                //const isRegex = query.startsWith('/') && query.endsWith('/'); // Regex is wrapped in "/"
                const isRegex = $('#regexToggle').is(':checked');
                let regex;

                if (isRegex) {
                    // Remove slashes and use the query as regex
                    //const regexBody = query.slice(1, -1); // Remove leading and trailing '/'
                    regex = new RegExp(query, 'i'); // 'i' for case-insensitive
                } else {
                    // Escape special characters for a literal search
                    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    regex = new RegExp(escapedQuery, 'i');
                }

                const rows = $('#dataTable tbody tr');
                rows.each(function () {
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
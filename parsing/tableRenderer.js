define(["jquery"], function ($) {
  return {
    renderTable: function (data, container, type) {
      const tableContainer = $(container);
      tableContainer.empty(); // Clear previous content

      // Check for cached data in globalThis cache
      const cachedData = getCache(`cached_${type}`);
      if (cachedData) {
        console.log(`Using cached data for ${type}`);
        data = cachedData; // Use cached data
      } else {
        console.log(`No cached data for ${type}`);
        setCache(`cached_${type}`, data); // Save new data to the cache
      }
      // Define the headers based on the type
      let headers = [];
      if (type === "Queries") {
        headers = ["Query Name", "Data Item Name", "Expression"];
      } else if (type === "Lists") {
        headers = ["Name", "Ref Query", "Data Item", "Label"];
      } else if (type === "Detail Filters") {
        headers = ["Query Name", "Filter Expression"];
      }

      // Create the table
      const table = $('<table id="dataTable"></table>');
      const thead = $("<thead></thead>");
      const headerRow = $("<tr></tr>");

      // Add headers dynamically
      headers.forEach((header) => {
        headerRow.append(`<th>${header}</th>`);
      });
      thead.append(headerRow);
      table.append(thead);

      const tbody = $("<tbody></tbody>");

      // Populate rows based on data
      data.forEach((item) => {
        if (type === "Queries") {
          // Add a row for each dataItem in the query
          item.items.forEach((subItem) => {
            const queryRow = $("<tr></tr>");
            queryRow.append(`<td>${item.name}</td>`); // Query Name
            queryRow.append(`<td>${subItem.name}</td>`); // Data Item Name
            queryRow.append(`<td>${subItem.attributes.expression || ""}</td>`); // Expression
            tbody.append(queryRow);
          });
        } else if (type === "Lists") {
          // Add a row for each refDataItem in the list
          item.items.forEach((subItem) => {
            const listRow = $("<tr></tr>");
            listRow.append(`<td>${item.name}</td>`); // List Name
            listRow.append(`<td>${item.attributes.refQuery}</td>`); // Ref Query
            listRow.append(`<td>${subItem.name}</td>`); // Data Item Name
            listRow.append(`<td>${subItem.attributes.label || ""}</td>`); // Label
            tbody.append(listRow);
          });
        } else if (type === "Detail Filters") {
          // Render a row for each filter
          const filterRow = $("<tr></tr>");
          filterRow.append(`<td>${item.name}</td>`); // Query Name
          filterRow.append(
            `<td>${item.attributes.filterExpression || ""}</td>`
          ); // Filter Expression
          tbody.append(filterRow);
        }
      });

      // Add tbody to the table
      table.append(tbody);

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
      searchInput.on("input", function () {
        const query = $("#searchInput").val();
        searchTable(query, type);
      });
    },
  };

  function searchTable(query, type) {
    try {
      const isRegex = $("#regexToggle").is(":checked");
      const regex = isRegex
        ? new RegExp(query, "i") // Case-insensitive regex
        : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"); // Escape for literal search

      const rows = $("#dataTable tbody tr");
      rows.each(function () {
        const cells = $(this).find("td");
        const match = Array.from(cells).some((cell) =>
          regex.test($(cell).text())
        );
        if (match) {
          $(this).show();
        } else {
          $(this).hide();
        }
      });
    } catch (e) {
      console.error("Invalid regex:", e);
    }
  }
});

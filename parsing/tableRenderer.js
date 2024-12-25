define(["jquery"], function ($) {
  return {
    renderTable: function (data, container, type) {
      const tableContainer = $(container);
      tableContainer.empty(); // Clear previous content

      // Define the headers based on the type
      let headers = [];
      if (type === "Queries") {
        headers = ["Query Name", "Data Item Name", "Expression", "Label"];
      } else if (type === "Lists") {
        headers = ["Name", "Ref Query", "Data Item", "Expression", "Label"];
      } else if (type === "Detail Filters") {
        headers = ["Query Name", "Filter Expression"];
      }

      // Create the table
      const table = $('<table id="dataTable"></table>');
      const thead = $("<thead></thead>");
      const headerRow = $("<tr></tr>");

      // Add headers dynamically with checkboxes
      const columnSearchFlags = Array(headers.length).fill(false);
      // Update the hover binding in your header creation code (in renderTable)
      headers.forEach((header, index) => {
        const th = $(`<th>${header}</th>`);

        // Modified hover handling
        th.on("mouseenter", function () {
          showPopup(index, data, type, $(this));
        });

        const checkbox = $(`
      <input type="checkbox" data-index="${index}" />
  `).on("change", function () {
          columnSearchFlags[index] = $(this).is(":checked");
        });
        th.append("<br>").append(checkbox);
        headerRow.append(th);
      });

      thead.append(headerRow);
      table.append(thead);

      const tbody = $("<tbody></tbody>");

      // Populate rows based on data
      data.forEach((item) => {
        if (type === "Queries") {
          item.items.forEach((subItem) => {
            const queryRow = $("<tr></tr>");
            queryRow.append(`<td>${item.name}</td>`);
            queryRow.append(`<td>${subItem.name}</td>`);
            queryRow.append(`<td>${subItem.attributes.expression || ""}</td>`);
            queryRow.append(`<td>${subItem.attributes.label || ""}</td>`);
            tbody.append(queryRow);
          });
        } else if (type === "Lists") {
          item.items.forEach((subItem) => {
            const listRow = $("<tr></tr>");
            listRow.append(`<td>${item.name}</td>`);
            listRow.append(`<td>${item.attributes.refQuery}</td>`);
            listRow.append(`<td>${subItem.name}</td>`);
            listRow.append(`<td>${subItem.attributes.expression || ""}</td>`);
            listRow.append(`<td>${subItem.attributes.label || ""}</td>`);
            tbody.append(listRow);
          });
        } else if (type === "Filters") {
          const filterRow = $("<tr></tr>");
          filterRow.append(`<td>${item.name}</td>`);
          filterRow.append(
            `<td>${item.attributes.filterExpression || ""}</td>`
          );
          tbody.append(filterRow);
        }
      });

      // Add tbody to the table
      table.append(tbody);

      // Add table to the container
      tableContainer.append(table);

      // Add search input field
      const searchInput = $(`
        <div class="search-container">
          <input id="searchInput" type="text" placeholder="Enter search terms column-by-column using ':::' (e.g., 'term1:::term2:::term3')" />
          <label class="checkbox-container">
            <input type="checkbox" id="regexToggle" />
            Use Regular Expression
          </label>
        </div>
      `);
      tableContainer.prepend(searchInput);

      // Add search functionality
      searchInput.on("input", function () {
        const query = $("#searchInput").val();
        searchTable(query, columnSearchFlags);
      });

      //==================================== searchTable function ================================================================================

      function searchTable(query, columnSearchFlags) {
        try {
          // If query is empty, show all rows
          if (!query.trim()) {
            $("#dataTable tbody tr").show();
            return;
          }

          const isRegex = $("#regexToggle").is(":checked");
          const rows = $("#dataTable tbody tr");

          // Split query by '::' if it contains the delimiter
          const columnQueries = query.includes("::")
            ? query.split("::").map((q) => q.trim())
            : [query];

          rows.each(function () {
            const cells = $(this).find("td");
            let match = true;

            // If using column-specific search
            if (columnQueries.length > 1) {
              match = columnQueries.every((columnQuery, index) => {
                // Skip empty queries
                if (!columnQuery) return true;

                // Skip if we have more queries than columns
                if (index >= cells.length) return true;

                // Create appropriate regex based on checkbox
                let columnRegex;
                try {
                  if (isRegex) {
                    // Direct regex when checkbox is checked
                    columnRegex = new RegExp(columnQuery, "i");
                  } else {
                    // Escape special characters for literal search
                    columnRegex = new RegExp(
                      columnQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                      "i"
                    );
                  }
                  return columnRegex.test($(cells[index]).text());
                } catch (e) {
                  console.error(`Invalid regex for column ${index}:`, e);
                  return false;
                }
              });
            }
            // If using global search (no delimiter)
            else {
              let regex;
              try {
                if (isRegex) {
                  // Direct regex when checkbox is checked
                  regex = new RegExp(query, "i");
                } else {
                  // Escape special characters for literal search
                  regex = new RegExp(
                    query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                    "i"
                  );
                }

                match = Array.from(cells).some((cell, index) => {
                  if (columnSearchFlags.some((flag) => flag)) {
                    return (
                      columnSearchFlags[index] && regex.test($(cell).text())
                    );
                  }
                  return regex.test($(cell).text());
                });
              } catch (e) {
                console.error("Invalid regex:", e);
                return false;
              }
            }

            // Show/hide row based on match
            $(this).toggle(match);
          });
        } catch (e) {
          console.error("Search error:", e);
          // On error, show all rows
          $("#dataTable tbody tr").show();
        }
      } // End of searchTable function

      //==================================== analyzeColumnData, getColumnValue, updateValueCount, showPopup, hidePopup functions ================================================================================

      // Add these functions within your return object, alongside renderTable

      function analyzeColumnData(data, columnIndex, type) {
        const values = new Map(); // Use Map to maintain insertion order
        let total = 0;

        // Extract all values for the given column based on type
        data.forEach((item) => {
          if (type === "Queries") {
            item.items.forEach((subItem) => {
              const value = getColumnValue(item, subItem, columnIndex, type);
              updateValueCount(values, value);
              total++;
            });
          } else if (type === "Lists") {
            item.items.forEach((subItem) => {
              const value = getColumnValue(item, subItem, columnIndex, type);
              updateValueCount(values, value);
              total++;
            });
          } else if (type === "Detail Filters") {
            const value = getColumnValue(item, null, columnIndex, type);
            updateValueCount(values, value);
            total++;
          }
        });

        // Sort by frequency (descending) and calculate percentages
        const sortedData = Array.from(values.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([value, count]) => ({
            value: value || "(empty)",
            count,
            percentage: ((count / total) * 100).toFixed(1),
          }));

        return {
          total,
          uniqueCount: values.size,
          frequencies: sortedData.slice(0, 10), // Top 10 most frequent values
        };
      }

      function getColumnValue(item, subItem, columnIndex, type) {
        if (type === "Queries") {
          switch (columnIndex) {
            case 0:
              return item.name;
            case 1:
              return subItem.name;
            case 2:
              return subItem.attributes.expression || "";
            case 3:
              return subItem.attributes.label || "";
          }
        } else if (type === "Lists") {
          switch (columnIndex) {
            case 0:
              return item.name;
            case 1:
              return item.attributes.refQuery || "";
            case 2:
              return subItem.name;
            case 3:
              return subItem.attributes.expression || "";
            case 4:
              return subItem.attributes.label || "";
          }
        } else if (type === "Detail Filters") {
          switch (columnIndex) {
            case 0:
              return item.name;
            case 1:
              return item.attributes.filterExpression || "";
          }
        }
        return "";
      }

      function updateValueCount(map, value) {
        const normalizedValue = value.trim();
        map.set(normalizedValue, (map.get(normalizedValue) || 0) + 1);
      }

      // Updated showPopup function
      function showPopup(index, data, type, element) {
        // Remove any existing popup
        hidePopup();

        // Analyze the column data
        const analysis = analyzeColumnData(data, index, type);

        // Create popup content
        const popup = $('<div class="column-popup"></div>').css({
          position: "absolute",
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "10px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          zIndex: 1000,
          maxWidth: "400px",
          maxHeight: "400px",
          overflowY: "auto",
        });

        // Add summary content
        popup.append(`
      <div style="margin-bottom: 10px;">
          <strong>Total Values:</strong> ${analysis.total}<br>
          <strong>Unique Values:</strong> ${analysis.uniqueCount}
      </div>
      <div style="margin-bottom: 10px;">
          <strong>Top Values:</strong>
      </div>
  `);

        // Add frequency table
        const table = $(
          '<table style="width: 100%; border-collapse: collapse;"></table>'
        );
        table.append(`
      <tr style="background-color: #f5f5f5;">
          <th style="padding: 5px; border: 1px solid #ddd;">Value</th>
          <th style="padding: 5px; border: 1px solid #ddd;">Count</th>
          <th style="padding: 5px; border: 1px solid #ddd;">%</th>
      </tr>
  `);

        analysis.frequencies.forEach((item) => {
          table.append(`
          <tr>
              <td style="padding: 5px; border: 1px solid #ddd;">${item.value}</td>
              <td style="padding: 5px; border: 1px solid #ddd; text-align: right;">${item.count}</td>
              <td style="padding: 5px; border: 1px solid #ddd; text-align: right;">${item.percentage}%</td>
          </tr>
      `);
        });

        popup.append(table);

        // Position the popup below the header
        const pos = element.offset();
        popup.css({
          left: pos.left + "px",
          top: pos.top + element.outerHeight() + "px",
        });

        // Add the popup to the body
        $("body").append(popup);

        // Set up event handling for popup persistence
        let isOverHeader = false;
        let isOverPopup = false;

        // Track mouse over header
        element
          .on("mouseenter", function () {
            isOverHeader = true;
          })
          .on("mouseleave", function () {
            isOverHeader = false;
            setTimeout(checkHidePopup, 100);
          });

        // Track mouse over popup
        popup
          .on("mouseenter", function () {
            isOverPopup = true;
          })
          .on("mouseleave", function () {
            isOverPopup = false;
            setTimeout(checkHidePopup, 100);
          });

        // Function to check if we should hide the popup
        function checkHidePopup() {
          if (!isOverHeader && !isOverPopup) {
            hidePopup();
          }
        }
      }

      function hidePopup() {
        $(".column-popup").remove();
      }

      // Add some CSS to your stylesheet
      const style = $("<style>").text(`
  .column-popup {
      background-color: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 10px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      z-index: 1000;
      max-width: 400px;
      max-height: 400px;
      overflow-y: auto;
  }
  .column-popup table {
      width: 100%;
      border-collapse: collapse;
  }
  .column-popup th, .column-popup td {
      padding: 5px;
      border: 1px solid #ddd;
  }
  .column-popup th {
      background-color: #f5f5f5;
  }
`);
      $("head").append(style);
    }, // End of renderTable function
  }; // End of return object
}); // End of define function

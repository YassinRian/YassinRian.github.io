define(["jquery"], function ($) {
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
      } else if (type === "Filters") {
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
    } else if (type === "Filters") {
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
                columnRegex = new RegExp(columnQuery, "i");
              } else {
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
              regex = new RegExp(query, "i");
            } else {
              regex = new RegExp(
                query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "i"
              );
            }

            match = Array.from(cells).some((cell, index) => {
              if (columnSearchFlags.some((flag) => flag)) {
                return columnSearchFlags[index] && regex.test($(cell).text());
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
      $("#dataTable tbody tr").show();
    }
  }

  function showPopup(index, data, type) {
    // Create a map to count unique item names
    const nameMap = new Map();
    let total = 0;

    // Count occurrences of item names
    data.forEach((item) => {
      const name = item.name.trim();
      nameMap.set(name, (nameMap.get(name) || 0) + 1);
      total++;
    });

    // Sort by frequency
    const sortedNames = Array.from(nameMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        value: name || "(empty)",
        count,
        percentage: ((count / total) * 100).toFixed(1),
      }));

    // Create popup content
    const popup = $('<div class="column-popup"></div>');

    // Add summary content
    popup.append(`
            <div style="margin-bottom: 10px;">
                <strong>Total Unique Names:</strong> ${nameMap.size}<br>
                <strong>Total Occurrences:</strong> ${total}
            </div>
            <div style="margin-bottom: 10px;">
                <strong>Name Distribution:</strong>
            </div>
        `);

    // Add frequency table
    const table = $(
      '<table style="width: 100%; border-collapse: collapse;"></table>'
    );
    table.append(`
            <tr style="background-color: #f5f5f5;">
                <th style="padding: 5px; border: 1px solid #ddd;">Name</th>
                <th style="padding: 5px; border: 1px solid #ddd;">Count</th>
                <th style="padding: 5px; border: 1px solid #ddd;">%</th>
            </tr>
        `);

    sortedNames.forEach((item) => {
      table.append(`
                <tr>
                    <td style="padding: 5px; border: 1px solid #ddd;">${item.value}</td>
                    <td style="padding: 5px; border: 1px solid #ddd; text-align: right;">${item.count}</td>
                    <td style="padding: 5px; border: 1px solid #ddd; text-align: right;">${item.percentage}%</td>
                </tr>
            `);
    });

    popup.append(table);

    // Position and style popup
    const headerRect = th[0].getBoundingClientRect();
    popup.css({
      position: "fixed",
      left: headerRect.left + "px",
      top: headerRect.bottom + window.scrollY + "px",
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

    $("body").append(popup);
    return popup;
  }

  return {
    renderTable: function (data, container, type) {
      const tableContainer = $(container);
      tableContainer.empty();

      // Define headers based on type
      let headers = [];
      if (type === "Queries") {
        headers = ["Query Name", "Data Item Name", "Expression", "Label"];
      } else if (type === "Lists") {
        headers = ["Name", "Ref Query", "Data Item", "Expression", "Label"];
      } else if (type === "Detail Filters") {
        headers = ["Query Name", "Filter Expression"];
      }

      // Create table structure
      const table = $('<table id="dataTable"></table>');
      const thead = $("<thead></thead>");
      const headerRow = $("<tr></tr>");

      // Add headers with hover functionality
      const columnSearchFlags = Array(headers.length).fill(false);
      let activePopup = null;

      headers.forEach((header, index) => {
        const th = $(`<th class="table-header">
                  <div class="header-content">${header}</div>
                  <div class="checkbox-container">
                      <input type="checkbox" data-index="${index}" />
                  </div>
              </th>`);

        if (index === 0) {
          // Setup hover handling
          let isOverHeader = false;
          let isOverPopup = false;

          th.on("mouseenter", function () {
            if (activePopup) {
              activePopup.remove();
            }
            isOverHeader = true;
            activePopup = showPopup(index, data, type, $(this));

            activePopup
              .on("mouseenter", function () {
                isOverPopup = true;
              })
              .on("mouseleave", function () {
                isOverPopup = false;
                setTimeout(() => {
                  if (!isOverHeader && !isOverPopup) {
                    activePopup.remove();
                    activePopup = null;
                  }
                }, 300);
              });
          }).on("mouseleave", function () {
            isOverHeader = false;
            setTimeout(() => {
              if (!isOverHeader && !isOverPopup) {
                if (activePopup) {
                  activePopup.remove();
                  activePopup = null;
                }
              }
            }, 300);
          });

          // Add a visual indicator that this column has popup functionality
          th.find(".header-content").append(
            ' <span style="cursor: help; color: #666;" title="Hover for analysis">📊</span>'
          );
        }
        // Add checkbox handler
        th.find('input[type="checkbox"]').on("change", function (e) {
          e.stopPropagation(); // Prevent event from bubbling
          columnSearchFlags[index] = $(this).is(":checked");
        });

        headerRow.append(th);
      });

      thead.append(headerRow);
      table.append(thead);

      // Add tbody and populate data
      const tbody = $("<tbody></tbody>");
      data.forEach((item) => {
        if (type === "Queries") {
          item.items.forEach((subItem) => {
            const row = $("<tr></tr>");
            row.append(`<td>${item.name}</td>`);
            row.append(`<td>${subItem.name}</td>`);
            row.append(`<td>${subItem.attributes.expression || ""}</td>`);
            row.append(`<td>${subItem.attributes.label || ""}</td>`);
            tbody.append(row);
          });
        } else if (type === "Lists") {
          item.items.forEach((subItem) => {
            const row = $("<tr></tr>");
            row.append(`<td>${item.name}</td>`);
            row.append(`<td>${item.attributes.refQuery}</td>`);
            row.append(`<td>${subItem.name}</td>`);
            row.append(`<td>${subItem.attributes.expression || ""}</td>`);
            row.append(`<td>${subItem.attributes.label || ""}</td>`);
            tbody.append(row);
          });
        } else if (type === "Detail Filters") {
          const row = $("<tr></tr>");
          row.append(`<td>${item.name}</td>`);
          row.append(`<td>${item.attributes.filterExpression || ""}</td>`);
          tbody.append(row);
        }
      });

      table.append(tbody);
      tableContainer.append(table);

      // Add search input
      const searchInput = $(`
              <div class="search-container">
                  <input id="searchInput" type="text" placeholder="Enter search terms column-by-column using '::' (e.g., 'term1::term2::term3')" />
                  <label class="checkbox-container">
                      <input type="checkbox" id="regexToggle" />
                      Use Regular Expression
                  </label>
              </div>
          `);
      tableContainer.prepend(searchInput);

      // Add search handler
      $("#searchInput").on("input", function () {
        searchTable($(this).val(), columnSearchFlags);
      });

      // Add CSS
      const style = $("<style>").text(`
              .table-header {
                  position: relative;
              }
              .header-content {
                  margin-bottom: 5px;
              }
              .checkbox-container {
                  position: relative;
              }
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


    }, //end renderTable
  }; //end return
}); //end define

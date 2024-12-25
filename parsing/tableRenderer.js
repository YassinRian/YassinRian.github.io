define([
  "jquery",
  "https://yassinrian.github.io/parsing/searchTable.js",
  "https://yassinrian.github.io/parsing/showPopup.js",
], function ($, searchTable, showPopup) {
  return {
    renderTable: function (data, container, type, searchInput) {
      const tableContainer = $(container);
      tableContainer.empty();

      // Define headers based on type
      let headers = [];
      if (type === "Queries") {
        headers = ["Query Name", "Data Item Name", "Expression", "Label"];
      } else if (type === "Lists") {
        headers = ["Name", "Ref Query", "Data Item", "Expression", "Label"];
      } else if (type === "Filters") {
        headers = ["Query Name", "Filter Expression"];
      }

      // Create table structure
      const table = $('<table id="dataTable"></table>');
      const thead = $("<thead></thead>");
      const headerRow = $("<tr></tr>");

      // Add sort state tracking
      const sortState = {
        column: null,
        ascending: true
      };

      // Add headers with hover and sort functionality
      const columnSearchFlags = Array(headers.length).fill(false);
      let activePopup = null;

      headers.forEach((header, index) => {
        const th = $(`<th class="table-header">
                  <div class="header-content">
                    ${header}
                    <span class="sort-icon" style="cursor: pointer; margin-left: 5px;">↕️</span>
                  </div>
                  <div class="checkbox-container">
                    <input type="checkbox" data-index="${index}" />
                  </div>
              </th>`);

        // Add sorting functionality
        th.find('.sort-icon').on('click', function() {
          const tbody = table.find('tbody');
          const rows = tbody.find('tr').toArray();
          
          // Update sort state
          if (sortState.column === index) {
            sortState.ascending = !sortState.ascending;
          } else {
            sortState.column = index;
            sortState.ascending = true;
          }

          // Update sort icon
          table.find('.sort-icon').text('↕️');
          $(this).text(sortState.ascending ? '↑' : '↓');

          // Sort rows
          rows.sort((a, b) => {
            const aValue = $(a).find(`td:eq(${index})`).text();
            const bValue = $(b).find(`td:eq(${index})`).text();
            
            // Try numeric sort first
            const aNum = parseFloat(aValue);
            const bNum = parseFloat(bValue);
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
              return sortState.ascending ? aNum - bNum : bNum - aNum;
            }
            
            // Fall back to string sort
            return sortState.ascending 
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          });

          // Reattach sorted rows
          tbody.empty();
          rows.forEach(row => tbody.append(row));
        });

        if (index === 0) {
          // Setup hover handling
          let isOverHeader = false;
          let isOverPopup = false;

          th.on("mouseenter", function () {
            if (activePopup) {
              activePopup.remove();
            }
            isOverHeader = true;
            const currentElement = $(this);

            activePopup = showPopup(data, currentElement);          
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

          // Add analysis indicator
          th.find(".header-content").append(
            ' <span style="cursor: help; color: #666;" title="Hover for analysis">📊</span>'
          );
        }

        // Add checkbox handler
        th.find('input[type="checkbox"]').on("change", function (e) {
          e.stopPropagation();
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
      tableContainer.prepend(searchInput);

      // Add search handler
      $("#searchInput").on("input", function () {
        searchTable($(this).val(), columnSearchFlags);
      });
    },
  };
});
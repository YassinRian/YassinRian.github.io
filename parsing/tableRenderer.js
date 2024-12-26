define([
  "jquery",
  "https://yassinrian.github.io/parsing/searchTable.js",
  "https://yassinrian.github.io/parsing/popUpManager.js",
], function ($, searchTable, PopupManager) {

  return {
    renderTable: function (data, container, type, searchInput) {
      console.log('tableRenderer.renderTable called with:', {
        dataExists: !!data,
        containerSelector: container,
        type,
        searchInputExists: !!searchInput
      });
      const tableContainer = $(container);

      console.log('Found container:', tableContainer.length > 0);
  
      if (!tableContainer.length) {
        console.error('Container not found:', container);
        return;
      }
      


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
                    ${index === 0 ? '<span class="analysis-icon" title="Hover for analysis">📊</span>' : ''}
                    <span class="header-text">${header}</span>
                    <span class="sort-icon" title="Sort column">↕️</span>
                  </div>
              </th>`);

        // Add header click for search selection
        th.on('click', function(e) {
          // Ignore clicks on icons
          if ($(e.target).hasClass('sort-icon') || $(e.target).hasClass('analysis-icon')) {
            return;
          }
          
          $(this).toggleClass('selected');
          columnSearchFlags[index] = $(this).hasClass('selected');
          
          // Trigger search update if input has value
          const searchValue = $('#searchInput').val();
          if (searchValue) {
            searchTable(searchValue, columnSearchFlags);
          }
        });

        // Add sorting functionality
        th.find('.sort-icon').on('click', function(e) {
          e.stopPropagation(); // Prevent header click event
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
          PopupManager.setupAnalysisIcon(th, data);
        }

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
        } else if (type === "Filters") {
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
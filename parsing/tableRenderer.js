define([
  "jquery",
  "https://yassinrian.github.io/parsing/searchTable.js",
  "https://yassinrian.github.io/parsing/popUpManager.js",
], function ($, searchTable, PopupManager) {
  
  class TableRenderer {
    constructor() {
      this.sortState = {
        column: null,
        ascending: true
      };
      
        // Add enhanced CSS styles
            // Add enhanced CSS styles
            $('head').append(`
              <style>
                .table-container {
                  width: 80%;
                  margin: 20px auto;
                  overflow-x: auto;
                  background: white;
                  border-radius: 8px;
                  border: 1px solid #e2e8f0;
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                             0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
      
                /* Ensure smooth scrolling on mobile */
                .table-container::-webkit-scrollbar {
                  height: 8px;
                }
      
                .table-container::-webkit-scrollbar-track {
                  background: #f7fafc;
                  border-radius: 4px;
                }
      
                .table-container::-webkit-scrollbar-thumb {
                  background: #e2e8f0;
                  border-radius: 4px;
                }
      
                .table-container::-webkit-scrollbar-thumb:hover {
                  background: #cbd5e0;
                }
      
                #dataTable {
                  width: 100%;
                  border-collapse: separate;
                  border-spacing: 0;
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;
                  font-size: 14px;
                  color: #2c3e50;
                  text-align: left;
                }
      
                #dataTable thead {
                  background-color: #f8fafc;
                  position: sticky;
                  top: 0;
                  z-index: 10;
                }
      
                #dataTable thead th {
                  padding: 14px 16px;
                  border-bottom: 2px solid #e2e8f0;
                  font-weight: 600;
                  color: #4a5568;
                  white-space: nowrap;
                  background: inherit; /* Ensures sticky header maintains background */
                }
      
                #dataTable tbody tr {
                  border-bottom: 1px solid #edf2f7;
                  transition: background-color 0.15s ease;
                }
      
                #dataTable tbody tr:nth-child(even) {
                  background-color: #fafafa;
                }
      
                #dataTable tbody td {
                  padding: 12px 16px;
                  line-height: 1.4;
                  vertical-align: middle;
                }
      
                #dataTable tbody tr:hover {
                  background-color: #f7fafc;
                }
      
                /* Make last row's bottom border match container */
                #dataTable tbody tr:last-child {
                  border-bottom: none;
                }
      
                /* Header styles */
                .table-header {
                  position: relative;
                  transition: background-color 0.2s ease;
                  user-select: none;
                }
      
                .table-header.selected,
                .table-header.selected .header-content {
                  background-color: #ebf5ff !important;
                }
                
                /* Ensure the selected state is visible */
                .table-header {
                  background-color: transparent;
                }
                
                .table-header .header-content {
                  background-color: inherit;
                  height: 100%;
                  width: 100%;
                }
      
                .header-content {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                }
      
                .sort-icon {
                  margin-left: auto;
                  cursor: pointer;
                  opacity: 0.5;
                  font-size: 0.85em;
                  transition: opacity 0.15s ease;
                }
      
                .sort-icon:hover {
                  opacity: 0.9;
                }
      
                .analysis-icon {
                  cursor: help;
                  opacity: 0.5;
                  font-size: 0.85em;
                  transition: opacity 0.15s ease;
                }
      
                .analysis-icon:hover {
                  opacity: 0.9;
                }
      
                /* Expression cell styles */
                .expression-cell {
                  position: relative;
                  max-width: 300px; /* Prevent cells from getting too wide */
                }
      
                .expression-content {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  gap: 8px;
                }
      
                .expression-text {
                  flex: 1;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
      
                .copy-icon {
                  opacity: 0;
                  transition: opacity 0.15s ease;
                  font-size: 0.85em;
                  color: #718096;
                  padding: 4px;
                  border-radius: 4px;
                  cursor: pointer;
                  flex-shrink: 0;
                }
      
                .expression-cell:hover .copy-icon {
                  opacity: 0.5;
                }
      
                .copy-icon:hover {
                  opacity: 1 !important;
                  background-color: #f7fafc;
                }
      
                /* Search input styles */
                #searchInput {
                  width: calc(100% - 24px);
                  padding: 8px 12px;
                  margin: 12px;
                  border: 1px solid #e2e8f0;
                  border-radius: 6px;
                  font-size: 14px;
                  transition: border-color 0.15s ease;
                }
      
                #searchInput:focus {
                  outline: none;
                  border-color: #90cdf4;
                  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
                }
              </style>
            `);
      } // end of constructor

    getHeadersForType(type) {
      const headerMap = {
        "Queries": ["Query Name", "Data Item Name", "Expression", "Label"],
        "Lists": ["Name", "Ref Query", "Data Item", "Expression", "Label"],
        "Filters": ["Query Name", "Filter Expression"]
      };
      return headerMap[type] || [];
    }

    createHeaderCell(header, index, table, columnSearchFlags, data) {
      const th = $(`<th class="table-header">
        <div class="header-content">
          ${index === 0 ? '<span class="analysis-icon" title="Hover for analysis">📊</span>' : ''}
          <span class="header-text">${header}</span>
          <span class="sort-icon" title="Sort column">↕️</span>
        </div>
      </th>`);

      this.setupHeaderClickHandler(th, index, columnSearchFlags);
      this.setupSortHandler(th, index, table);
      
      if (index === 0) {
        PopupManager.setupAnalysisIcon(th, data);
      }

      return th;
    }

    setupHeaderClickHandler(th, index, columnSearchFlags) {
      th.on('click', function(e) {
        if ($(e.target).hasClass('sort-icon') || $(e.target).hasClass('analysis-icon')) {
          return;
        }
        
        $(this).toggleClass('selected');
        columnSearchFlags[index] = $(this).hasClass('selected');
        
        const searchValue = $('#searchInput').val();
        if (searchValue) {
          searchTable(searchValue, columnSearchFlags);
        }
      });
    }

    setupSortHandler(th, index, table) {
      th.find('.sort-icon').on('click', (e) => {
        e.stopPropagation();
        const tbody = table.find('tbody');
        const rows = tbody.find('tr').toArray();
        
        if (this.sortState.column === index) {
          this.sortState.ascending = !this.sortState.ascending;
        } else {
          this.sortState.column = index;
          this.sortState.ascending = true;
        }

        table.find('.sort-icon').text('↕️');
        $(e.target).text(this.sortState.ascending ? '↑' : '↓');

        this.sortRows(rows, index, tbody);
      });
    }

    sortRows(rows, index, tbody) {
      rows.sort((a, b) => {
        const aValue = $(a).find(`td:eq(${index})`).text();
        const bValue = $(b).find(`td:eq(${index})`).text();
        
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return this.sortState.ascending ? aNum - bNum : bNum - aNum;
        }
        
        return this.sortState.ascending 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });

      tbody.empty();
      rows.forEach(row => tbody.append(row));
    }

    createExpressionCell(expression) {
      const cell = $(`<td class="expression-cell">
        <div class="expression-content">
          <span class="expression-text">${expression || ""}</span>
          <span class="copy-icon" style="display: none; cursor: pointer; margin-left: 5px;" title="Copy expression">📋</span>
        </div>
      </td>`);

      cell.hover(
        function() { $(this).find('.copy-icon').show(); },
        function() { $(this).find('.copy-icon').hide(); }
      );

      cell.find('.copy-icon').on('click', function(e) {
        e.stopPropagation();
        const expressionText = $(this).siblings('.expression-text').text();
        navigator.clipboard.writeText(expressionText).then(() => {
          // Show a temporary "Copied!" message
          const copyIcon = $(this);
          const originalText = copyIcon.text();
          copyIcon.text('✓');
          setTimeout(() => {
            copyIcon.text(originalText);
          }, 1000);
        });
      });

      return cell;
    }

    createTableRow(item, type, subItem = null) {
      const row = $("<tr></tr>");
      
      if (type === "Queries") {
        row.append(`<td>${item.name}</td>`);
        row.append(`<td>${subItem.name}</td>`);
        row.append(this.createExpressionCell(subItem.attributes.expression));
        row.append(`<td>${subItem.attributes.label || ""}</td>`);
      } else if (type === "Lists") {
        row.append(`<td>${item.name}</td>`);
        row.append(`<td>${item.attributes.refQuery}</td>`);
        row.append(`<td>${subItem.name}</td>`);
        row.append(this.createExpressionCell(subItem.attributes.expression));
        row.append(`<td>${subItem.attributes.label || ""}</td>`);
      } else if (type === "Filters") {
        row.append(`<td>${item.name}</td>`);
        row.append(this.createExpressionCell(item.attributes.filterExpression));
      }
      
      return row;
    }

    populateTableBody(table, data, type) {
      const tbody = $("<tbody></tbody>");
      
      data.forEach((item) => {
        if (type === "Filters") {
          tbody.append(this.createTableRow(item, type));
        } else {
          item.items.forEach((subItem) => {
            tbody.append(this.createTableRow(item, type, subItem));
          });
        }
      });

      table.append(tbody);
    }

    renderTable(data, container, type, searchInput) {
      const tableContainer = $(container);
      tableContainer.empty();

      const headers = this.getHeadersForType(type);
      const table = $('<table id="dataTable"></table>');
      const thead = $("<thead></thead>");
      const headerRow = $("<tr></tr>");
      const columnSearchFlags = Array(headers.length).fill(false);

      headers.forEach((header, index) => {
        headerRow.append(this.createHeaderCell(header, index, table, columnSearchFlags, data));
      });

      thead.append(headerRow);
      table.append(thead);

      this.populateTableBody(table, data, type);
      
      tableContainer.append(table);
      tableContainer.prepend(searchInput);

      $("#searchInput").on("input", function () {
        searchTable($(this).val(), columnSearchFlags);
      });
    }
  }

  return new TableRenderer();

});
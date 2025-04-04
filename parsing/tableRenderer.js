define([
  "jquery",
  "https://yassinrian.netlify.app/parsing/searchTable.js",
  "https://yassinrian.netlify.app/parsing/popUpManager.js",
], function ($, searchTable, PopupManager) {
  
  class TableRenderer {
    constructor() {
      this.sortState = {
        column: null,
        ascending: true
      };
      
      // Remove any existing styles
      const existingStyles = document.getElementById('table-renderer-styles');
      if (existingStyles) {
        existingStyles.remove();
      }

      // Add styles
      const styleElement = document.createElement('style');
      styleElement.id = 'table-renderer-styles';
      styleElement.textContent = `
          #dataTable {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 16px;
            color: #333;
          }

          #dataTable thead {
            background-color: #2196F3;
            position: sticky;
            top: 0;
            z-index: 10;
          }

          #dataTable th {
            position: relative;
            padding: 16px 20px;
            color: white;
            font-weight: 500;
            border-bottom: 2px solid rgba(0,0,0,0.1);
            min-width: 100px;
          }

          .table-header {
            position: relative;
            user-select: none;
          }

          .table-header.selected {
            background-color: #1976D2;
          }

          .header-content {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .resize-handle {
            position: absolute;
            top: 0;
            right: 0;
            width: 5px;
            height: 100%;
            cursor: col-resize;
            opacity: 0;
            background-color: rgba(255, 255, 255, 0.5);
            transition: opacity 0.2s;
          }

          .table-header:hover .resize-handle,
          .resize-handle:hover {
            opacity: 1;
          }

          #dataTable tbody tr {
            border-bottom: 1px solid #ddd;
          }

          #dataTable tbody td {
            padding: 16px 20px;
            line-height: 1.5;
          }

          .sort-icon, .analysis-icon {
            cursor: pointer;
            opacity: 0.8;
          }

          .sort-icon {
            margin-left: auto;
          }

          .expression-cell {
            position: relative;
          }

          .expression-content {
            display: flex;
            align-items: center;
            gap: 8px;
            word-break: break-all;
          }

          .expression-text {
            flex: 1;
            white-space: pre-wrap;
          }

          .copy-icon {
            opacity: 0;
            cursor: pointer;
            padding: 4px;
            transition: opacity 0.2s;
          }

          .expression-cell:hover .copy-icon {
            opacity: 0.8;
          }

          #searchInput {
            width: calc(100% - 40px);
            padding: 12px;
            margin: 20px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 15px;
          }
      `;
      
      document.head.appendChild(styleElement);
    }

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
        <div class="resize-handle"></div>
      </th>`);

      this.setupHeaderClickHandler(th, index, columnSearchFlags);
      this.setupSortHandler(th, index, table);
      this.setupResizeHandler(th);
      
      if (index === 0) {
        PopupManager.setupAnalysisIcon(th, data);
      }

      return th;
    }

    setupResizeHandler(th) {
      const handle = th.find('.resize-handle');
      let startX, startWidth;

      handle.on('mousedown', (e) => {
        startX = e.pageX;
        startWidth = th.width();
        const mouseMoveHandler = (e) => {
          const width = startWidth + (e.pageX - startX);
          if (width >= 100) {
            th.width(width);
          }
        };
        
        $(document).on('mousemove', mouseMoveHandler);
        $(document).one('mouseup', () => {
          $(document).off('mousemove', mouseMoveHandler);
        });
        
        e.preventDefault();
        e.stopPropagation();
      });
    }

    setupHeaderClickHandler(th, index, columnSearchFlags) {
      th.on('click', function(e) {
        if ($(e.target).hasClass('sort-icon') || $(e.target).hasClass('analysis-icon') || $(e.target).hasClass('resize-handle')) {
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

    createExpressionCell(expression) {
      const cell = $(`<td class="expression-cell">
        <div class="expression-content">
          <span class="expression-text">${expression || ""}</span>
          <span class="copy-icon" style="display: none;">📋</span>
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
          const copyIcon = $(this);
          copyIcon.text('✓');
          setTimeout(() => copyIcon.text('📋'), 1000);
        });
      });

      return cell;
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
      tableContainer.append(searchInput);
      tableContainer.append(table);

      $("#searchInput").on("input", function () {
        searchTable($(this).val(), columnSearchFlags);
      });
    }
  }

  return new TableRenderer();
});
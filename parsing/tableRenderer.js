define([
  "jquery",
  "https://yassinrian.github.io/parsing/searchTable.js",
  "https://yassinrian.github.io/parsing/showPopup.js",
], function ($, searchTable, showPopup) {
  return {
    renderTable: function (data, container, type, searchInput) {
      const tableContainer = $(container);
      tableContainer.empty();

      let headers = [];
      if (type === "Queries") {
        headers = ["Query Name", "Data Item Name", "Expression", "Label"];
      } else if (type === "Lists") {
        headers = ["Name", "Ref Query", "Data Item", "Expression", "Label"];
      } else if (type === "Filters") {
        headers = ["Query Name", "Filter Expression"];
      }

      let sortOrder = 1; // 1 for ascending, -1 for descending
      let currentSortIndex = null;

      const table = $('<table id="dataTable"></table>');
      const thead = $("<thead></thead>");
      const headerRow = $("<tr></tr>");

      const columnSearchFlags = Array(headers.length).fill(false);
      let activePopup = null;

      headers.forEach((header, index) => {
        const th = $(`<th class="table-header">
                  <div class="header-content">
                      ${header}
                      <span class="sort-icons">
                          <span class="sort-asc" style="cursor: pointer;">▲</span>
                          <span class="sort-desc" style="cursor: pointer;">▼</span>
                      </span>
                  </div>
                  <div class="checkbox-container">
                      <input type="checkbox" data-index="${index}" />
                  </div>
              </th>`);

        if (index === 0) {
          // Restore popup functionality for the first column
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

          th.find(".header-content").append(
            ' <span style="cursor: help; color: #666;" title="Hover for analysis">📊</span>'
          );
        }

        // Sort functionality with arrow icons
        th.find(".sort-asc, .sort-desc").on("click", function (e) {
          e.stopPropagation();

          const isAscending = $(this).hasClass("sort-asc");
          sortOrder = isAscending ? 1 : -1;

          if (currentSortIndex !== index) {
            currentSortIndex = index;
          }

          data.sort((a, b) => {
            const valA = getCellValue(a, index, type);
            const valB = getCellValue(b, index, type);

            if (valA == null) return sortOrder;
            if (valB == null) return -sortOrder;

            return valA.toString().localeCompare(valB.toString()) * sortOrder;
          });

          this.renderTable(data, container, type, searchInput);
        }.bind(this));

        // Add checkbox handler
        th.find('input[type="checkbox"]').on("change", function (e) {
          e.stopPropagation();
          columnSearchFlags[index] = $(this).is(":checked");
        });

        headerRow.append(th);
      });

      thead.append(headerRow);
      table.append(thead);

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

      $("#searchInput").on("input", function () {
        searchTable($(this).val(), columnSearchFlags);
      });

      function getCellValue(item, colIndex, type) {
        if (type === "Queries") {
          return colIndex === 0
            ? item.name
            : item.items[0]?.attributes[headers[colIndex].toLowerCase()] || "";
        } else if (type === "Lists") {
          return colIndex === 0
            ? item.name
            : item.items[0]?.attributes[headers[colIndex].toLowerCase()] || "";
        } else if (type === "Filters") {
          return colIndex === 0
            ? item.name
            : item.attributes.filterExpression || "";
        }
        return "";
      }
    }, //end renderTable
  }; //end return
}); //end define

define([
"jquery",  
"https://yassinrian.github.io/parsing/searchTable.js",
"https://yassinrian.github.io/parsing/popUp.js",
],function ($, searchTable, showPopup) {
  
  let activePopup_async = showPopup(data, $(this));

  // requirejs(["https://yassinrian.github.io/parsing/popUp.js"], function ($) {
  //   activePopup_async = showPopup(data, $(this));
  // });
//======================================================================================================================
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
            activePopup = activePopup_async;            
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
            }, 300); // Delay removal to allow mouse to enter popup

          }); //end th.on

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
      tableContainer.prepend(searchInput);

      // Add search handler
      $("#searchInput").on("input", function () {
        searchTable($(this).val(), columnSearchFlags);
      });



    }, //end renderTable
  }; //end return
}); //end define


define([
"jquery",  
"https://yassinrian.github.io/parsing/searchTable.js"
],function ($, searchTable) {

 // =================================== function showPopup ==================================================================== 
  function showPopup (data, th) {
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
  } //end showPopup
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
            activePopup = showPopup(data, $(this));           
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


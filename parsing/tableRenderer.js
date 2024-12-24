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
      headers.forEach((header, index) => {
        const th = $(`<th>${header}</th>`);

        // Add hover functionality for the column
        th.hover(
          function () {
            showPopup(index, data, type, $(this));
          },
          function () {
            hidePopup();
          }
        );

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
          <input id="searchInput" type="text" placeholder="Enter regex to search..." />
          <label class="checkbox-container">
            <input type="checkbox" id="regexToggle" />
            Use Regular Expression
          </label>
        </div>
      `);
      tableContainer.prepend(searchInput);

      // Search functionality
      searchInput.on("input", function () {
        const query = $("#searchInput").val();
        searchTable(query, columnSearchFlags);
      });

      // Add a popup container
      const popup = $('<div id="popup" style="display:none; position:absolute; z-index:1000; background:#fff; border:1px solid #ccc; padding:5px;"></div>');
      tableContainer.append(popup);
    },
  };

  function showPopup(index, data, type, element) {
    const popup = $("#popup");
    const groups = new Set();

    data.forEach((item) => {
      if (type === "Queries" && index === 0) {
        groups.add(item.name);
      } else if (type === "Queries" && index === 1) {
        item.items.forEach((subItem) => groups.add(subItem.name));
      } else if (type === "Lists" && index === 0) {
        groups.add(item.name);
      } else if (type === "Lists" && index === 1) {
        groups.add(item.attributes.refQuery);
      }
    });

    const content = Array.from(groups).join("<br>");
    popup.html(content).css({
      display: "block",
      top: element.offset().top + element.height(),
      left: element.offset().left,
    });
  }

  function hidePopup() {
    $("#popup").css("display", "none");
  }

  function searchTable(query, columnSearchFlags) {
    try {
      const isRegex = $("#regexToggle").is(":checked");
      const regex = isRegex
        ? new RegExp(query, "i") // Case-insensitive regex
        : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"); // Escape for literal search

      const rows = $("#dataTable tbody tr");
      rows.each(function () {
        const cells = $(this).find("td");
        const match = Array.from(cells).some((cell, index) => {
          if (columnSearchFlags.some((flag) => flag)) {
            return columnSearchFlags[index] && regex.test($(cell).text());
          }
          return regex.test($(cell).text());
        });
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

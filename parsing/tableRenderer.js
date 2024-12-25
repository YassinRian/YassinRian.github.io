define(["jquery","https://yassinrian.github.io/parsing/popup.js"], function ($, popup) {
  function renderTable(data, container, type) {
    const tableContainer = $(container);
    tableContainer.empty();

    const headers = {
      Queries: ["Query Name", "Data Item Name", "Expression", "Label"],
      Lists: ["Name", "Ref Query", "Data Item", "Expression", "Label"],
      Filters: ["Query Name", "Filter Expression"],
    }[type];

    const table = $('<table id="dataTable"></table>');
    const thead = $("<thead></thead>");
    const headerRow = $("<tr></tr>");
    let activePopup = null;

    headers.forEach((header, index) => {
      const th = $(`<th>${header}</th>`);
      th.on("mouseenter", function () {
        if (activePopup) activePopup.remove();
        activePopup = popup.createPopup(data, $(this));
      });
      th.on("mouseleave", function () {
        setTimeout(() => {
          if (activePopup) {
            activePopup.remove();
            activePopup = null;
          }
        }, 300);
      });
      headerRow.append(th);
    });

    thead.append(headerRow);
    table.append(thead);

    const tbody = $("<tbody></tbody>");
    data.forEach((item) => {
      const row = $("<tr></tr>");
      headers.forEach(() => {
        row.append("<td></td>"); // Fill with actual data mapping
      });
      tbody.append(row);
    });

    table.append(tbody);
    tableContainer.append(table);
  }

  return {
    renderTable,
  };
});

define(["jquery"], function ($) {
  return {
    searchTable: function (query, columnSearchFlags) {
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
    }, //end searchTable
  };
});

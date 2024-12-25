define(["jquery"], function ($) {
    return 
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
          
          return showPopup; // Correctly export the function
    });
  
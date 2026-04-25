define(["jquery"], function ($) {
  "use strict";

  class CashflowTable {
    constructor(containerId) {
      this.containerId = containerId;
    }

    render(data, append = false) {
      const $container = $("#" + this.containerId);

      // 1. Generate the rows only
      let rowsHtml = data
        .map(
          (row) => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding:10px;">${row.label}</td>
            <td style="padding:10px; text-align:right;">${this.formatEuro(row.total_budget)}</td>
            <td style="padding:10px; text-align:right;">${this.formatEuro(row.running_total)}</td>
        </tr>
    `,
        )
        .join("");

      if (append) {
        // Just add to the existing tbody
        $container.find("tbody").append(rowsHtml);
      } else {
        // Create the full table structure
        let tableHtml = `
            <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="border-bottom: 2px solid #004699; background: #f9f9f9;">
                        <th style="text-align:left; padding:12px;">Jaar</th>
                        <th style="text-align:right; padding:12px;">Budget</th>
                        <th style="text-align:right; padding:12px;">Cumulatief</th>
                    </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
            </table>
            <div style="text-align:center; padding:15px;">
                <button id="btn-load-more" style="background:#004699; color:white; border:none; padding:8px 16px; border-radius:4px; cursor:pointer;">
                    Toon meer resultaten...
                </button>
            </div>
        `;
        $container.html(tableHtml);

        // Attach event listener to the NEWLY created button
        $container
          .off("click", "#btn-load-more")
          .on("click", "#btn-load-more", () => {
            // Signal back to controller (we'll handle this in Main)
            window.dispatchEvent(new CustomEvent("rtm-load-more"));
          });
      }
    }

    formatEuro(val) {
      return new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR",
      }).format(val);
    }
  }
  return CashflowTable;
});

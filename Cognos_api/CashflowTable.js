define(["jquery"], function ($) {
  "use strict";

  class CashflowTable {
    constructor(containerId) {
      this.containerId = containerId;
    }

 render(data, isInitial = true) {
    const $container = $("#" + this.containerId);
    
    const rowsHtml = data.map(row => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding:10px; font-weight:bold;">${row.label}</td>
            <td style="padding:10px; text-align:right;">${this.formatEuro(row.total_budget)}</td>
            <td style="padding:10px; text-align:right; font-weight:bold;">${this.formatEuro(row.running_total)}</td>
        </tr>
    `).join('');

    // If it's a slider sync, just swap the Tbody content for speed
    const $tbody = $container.find("tbody");
    if ($tbody.length > 0 && !isInitial) {
        $tbody.html(rowsHtml);
        return;
    }

    // Otherwise, render the whole structure (Initial load)
    $container.html(`
        <table style="width:100%; border-collapse: collapse;">
            <thead>
                <tr style="background:#f4f4f4; border-bottom:2px solid #004699;">
                    <th style="padding:10px; text-align:left;">Jaar</th>
                    <th style="padding:10px; text-align:right;">Budget</th>
                    <th style="padding:10px; text-align:right;">Cumulatief</th>
                </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
        </table>
    `);
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

define(["jquery"], function($) {
    "use strict";

    class CashflowTable {
        constructor(containerId) {
            this.containerId = containerId;
        }

        render(data) {
            const $container = $("#" + this.containerId);
            
            let html = `
                <table style="width:100%; border-collapse: collapse; margin-top: 20px; font-family: sans-serif;">
                    <thead>
                        <tr style="border-bottom: 2px solid #004699; background: #f9f9f9;">
                            <th style="text-align:left; padding:12px;">Jaar</th>
                            <th style="text-align:right; padding:12px;">Budget (€)</th>
                            <th style="text-align:right; padding:12px;">Cumulatief Totaal (€)</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            data.forEach(row => {
                const budgetColor = row.total_budget < 0 ? "#d9534f" : "#333";
                html += `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding:10px; font-weight:bold;">${row.label}</td>
                        <td style="padding:10px; text-align:right; color: ${budgetColor};">
                            ${this.formatEuro(row.total_budget)}
                        </td>
                        <td style="padding:10px; text-align:right; font-weight:bold;">
                            ${this.formatEuro(row.running_total)}
                        </td>
                    </tr>
                `;
            });

            html += `</tbody></table>`;
            $container.html(html);
        }

        formatEuro(val) {
            return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(val);
        }
    }
    return CashflowTable;
});

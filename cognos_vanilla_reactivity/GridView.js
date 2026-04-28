define([], function () {
    "use strict";
    return {
        render: (data) => {
            if (!data || data.length === 0) return `<div style="padding:10px">Geen data geselecteerd</div>`;

            const rows = data.map(row => {
                const isNegative = row.budget < 0;
                const color = isNegative ? '#dc3545' : '#28a745';

                return `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px;">${row.label}</td>
                <td style="padding: 8px; text-align: right; color: ${color}; font-weight: bold;">
                    € ${Number(row.budget).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                </td>
            </tr>
        `;
            }).join("");

            return `
                <article style="padding: 0; overflow: hidden;">
                    <header style="padding: 0.5rem 1rem; font-size: 0.9rem; font-weight: bold;">Detailoverzicht</header>
                    <div style="max-height: 300px; overflow-y: auto;">
                        <table role="grid" style="margin-bottom: 0;">
                            <thead>
                                <tr>
                                    <th scope="col">Jaar</th>
                                    <th scope="col" style="text-align:right">Budget</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.map(row => `
                                    <tr>
                                        <td>${row.label}</td>
                                        <td style="text-align:right; color: ${row.budget >= 0 ? '#28a745' : '#dc3545'}; font-weight: bold;">
                                            € ${Number(row.budget).toLocaleString('nl-NL')}
                                        </td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
                </article>
            `;
        }
    };
});
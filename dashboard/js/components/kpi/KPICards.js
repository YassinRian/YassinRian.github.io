define([], function () {
  "use strict";

  /**
   * KPICards — Summary metric cards rendered at the top of the dashboard.
   *
   * Expects data from DashboardModel.getKPIs():
   *   [{ total_opbrengsten, total_kosten, netto_resultaat,
   *      project_count, year_min, year_max }]
   */
  function KPICards(domNode) {
    this._node = domNode;
  }

  KPICards.prototype.update = function (kpiRow) {
    if (!kpiRow || kpiRow.length === 0) {
      this._node.innerHTML = "";
      return;
    }

    var k = kpiRow[0];

    var cards = [
      {
        label: "Totale Opbrengsten",
        value: formatEuro(k.total_opbrengsten),
        icon: "📈",
        color: "#2d8a4e"
      },
      {
        label: "Totale Kosten",
        value: formatEuro(k.total_kosten),
        icon: "📉",
        color: "#d94141"
      },
      {
        label: "Netto Resultaat",
        value: formatEuro(k.netto_resultaat),
        icon: "💰",
        color: k.netto_resultaat >= 0 ? "#1a237e" : "#d94141"
      },
      {
        label: "Projecten",
        value: k.project_count + " projecten",
        sub: k.year_min + " – " + k.year_max,
        icon: "🏗️",
        color: "#1890ff"
      }
    ];

    var html = '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px;">';

    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      html += [
        '<div style="',
        '  background: white;',
        '  border-radius: 8px;',
        '  padding: 20px 16px;',
        '  box-shadow: 0 1px 3px rgba(0,0,0,0.1);',
        '  border-left: 4px solid ' + c.color + ';',
        '  display: flex;',
        '  align-items: center;',
        '  gap: 14px;',
        '">',
        '  <div style="font-size: 32px;">' + c.icon + "</div>",
        '  <div>',
        '    <div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">' + c.label + "</div>",
        '    <div style="font-size: 22px; font-weight: 700; color: ' + c.color + ';">' + c.value + "</div>",
        c.sub ? '    <div style="font-size: 12px; color: #999;">' + c.sub + "</div>" : "",
        "  </div>",
        "</div>"
      ].join("\n");
    }

    html += "</div>";
    this._node.innerHTML = html;
  };

  function formatEuro(val) {
    if (val == null || isNaN(val)) return "—";
    var n = Number(val);
    var sign = n < 0 ? "−" : "";
    return sign + "€ " + Math.abs(n).toLocaleString("nl-NL");
  }

  return KPICards;
});

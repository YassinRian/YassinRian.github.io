define(["../../utils/dom.js"], function (dom) {
  "use strict";

  /**
   * KPICards — Summary metric cards (class syntax + htm templates).
   */
  class KPICards {
    constructor(domNode) {
      this._node = domNode;
    }

    update(kpiRow) {
      if (!kpiRow || kpiRow.length === 0) {
        dom.render(this._node, null);
        return;
      }

      var k = kpiRow[0];

      var cards = [
        { label: "Totale Opbrengsten", value: fmtEuro(k.total_opbrengsten), icon: "📈", color: "#2d8a4e" },
        { label: "Totale Kosten",      value: fmtEuro(k.total_kosten),      icon: "📉", color: "#d94141" },
        { label: "Netto Resultaat",    value: fmtEuro(k.netto_resultaat),   icon: "💰", color: k.netto_resultaat >= 0 ? "#1a237e" : "#d94141" },
        { label: "Projecten",          value: k.project_count + " projecten", sub: k.year_min + " – " + k.year_max, icon: "🏗️", color: "#1890ff" }
      ];

      var gridStyle = "display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:20px";
      var cardBase  = "background:white;border-radius:8px;padding:20px 16px;box-shadow:0 1px 3px rgba(0,0,0,0.1);display:flex;align-items:center;gap:14px";

      var el = dom.html`<div style="${gridStyle}">
        ${cards.map(function (c) {
          return dom.html`<div style="${cardBase};border-left:4px solid ${c.color}">
            <div style="font-size:32px">${c.icon}</div>
            <div>
              <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px">${c.label}</div>
              <div style="font-size:22px;font-weight:700;color:${c.color}">${c.value}</div>
              ${c.sub ? dom.html`<div style="font-size:12px;color:#999">${c.sub}</div>` : null}
            </div>
          </div>`;
        })}
      </div>`;

      dom.render(this._node, el);
    }
  }

  function fmtEuro(val) {
    if (val == null || isNaN(val)) return "—";
    var n = Number(val);
    var sign = n < 0 ? "−" : "";
    return sign + "€ " + Math.abs(n).toLocaleString("nl-NL");
  }

  return KPICards;
});

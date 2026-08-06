define([], function () {
  "use strict";

  /**
   * DetailTable — Tabulator-powered data table component.
   *
   * Features:
   *   - Sorting, filtering, pagination (built-in Tabulator)
   *   - Row selection emits "table:selection" for cross-filtering
   *   - Column formatting (currency, dates)
   */
  function DetailTable(domNode, eventBus) {
    this._node = domNode;
    this._bus = eventBus;
    this._table = null;
    this._data = [];
  }

  DetailTable.prototype._getColumns = function () {
    return [
      { title: "Project Nr",    field: "Project_nummer",            width: 120 },
      { title: "Project Naam",  field: "Project_naam_nummer",       width: 200 },
      { title: "Jaar",          field: "Jaar",                      width: 65,  hozAlign: "center" },
      { title: "Event",         field: "Gebeurtenis_code",          width: 65,  hozAlign: "center" },
      { title: "Opbrengsten",   field: "Restbudget_opbrengsten",    width: 120, hozAlign: "right", formatter: fmtEuro },
      { title: "Kosten",        field: "Restbudget_kosten",         width: 120, hozAlign: "right", formatter: fmtEuro },
      { title: "Res. Neming",   field: "Restbudget_resultaatneming", width: 120, hozAlign: "right", formatter: fmtEuro },
      { title: "Lopend Totaal", field: "Lopend_totaal",             width: 130, hozAlign: "right", formatter: fmtEuroBold }
    ];
  };

  DetailTable.prototype.setData = function (rows) {
    console.log("[DetailTable] setData:", rows ? rows.length : 0, "rows, node:", !!this._node);
    this._data = rows;

    if (!this._node) {
      console.error("[DetailTable] No DOM node");
      return;
    }

    // If table already exists, just update data
    if (this._table) {
      this._table.replaceData(rows);
      return;
    }

    // Check Tabulator is available
    if (typeof Tabulator === "undefined") {
      console.error("[DetailTable] Tabulator global not found — falling back to HTML table");
      this._renderFallback(rows);
      return;
    }

    console.log("[DetailTable] Creating Tabulator… node:", this._node.id);
    try {
      this._table = new Tabulator(this._node, {
        data: rows,
        columns: this._getColumns(),
        layout: "fitData",
        pagination: true,
        paginationSize: 15,
        paginationSizeSelector: [10, 15, 25, 50],
        initialSort: [{ column: "Jaar", dir: "desc" }]
      });
      console.log("[DetailTable] Tabulator created OK");

      var self = this;
      this._table.on("rowClick", function (e, row) {
        var d = row.getData();
        self._bus.emit("table:selection", {
          Jaar: [Number(d.Jaar)],
          Project_nummer: [d.Project_nummer]
        });
      });
    } catch (err) {
      console.error("[DetailTable] Tabulator error:", err.message);
      this._renderFallback(rows);
    }
  };

  /**
   * Fallback: plain HTML table if Tabulator is unavailable.
   */
  DetailTable.prototype._renderFallback = function (rows) {
    console.log("[DetailTable] Rendering fallback HTML table");
    var cols = this._getColumns();
    var html = '<table style="width:100%;border-collapse:collapse;font-size:12px;">';

    // Header
    html += "<tr>";
    for (var c = 0; c < cols.length; c++) {
      html += '<th style="border:1px solid #ddd;padding:8px;background:#f5f5f5;text-align:left;">' + cols[c].title + "</th>";
    }
    html += "</tr>";

    // Rows (max 50 for performance)
    var max = Math.min(rows.length, 50);
    for (var r = 0; r < max; r++) {
      html += "<tr>";
      for (var c2 = 0; c2 < cols.length; c2++) {
        var val = rows[r][cols[c2].field];
        html += '<td style="border:1px solid #eee;padding:6px;">' + (val != null ? val : "") + "</td>";
      }
      html += "</tr>";
    }
    html += "</table>";

    if (rows.length > 50) {
      html += '<p style="color:#999;font-size:11px;padding:8px;">Toont 50 van ' + rows.length + " rijen</p>";
    }

    this._node.innerHTML = html;
  };

  // ─── FORMATTERS ─────────────────────────────────────────────

  function fmtEuro(cell) {
    var v = cell.getValue();
    if (v == null || isNaN(v)) return "";
    var n = Number(v);
    var cls = n >= 0 ? "#2d8a4e" : "#d94141";
    return '<span style="color:' + cls + '">€ ' + n.toLocaleString("nl-NL") + "</span>";
  }

  function fmtEuroBold(cell) {
    var v = cell.getValue();
    if (v == null || isNaN(v)) return "";
    var n = Number(v);
    var cls = n >= 0 ? "#1a237e" : "#d94141";
    return '<span style="color:' + cls + ';font-weight:600">€ ' + n.toLocaleString("nl-NL") + "</span>";
  }

  return DetailTable;
});

define([], function () {
  "use strict";

  /**
   * DetailTable — Tabulator data table (class syntax + dynamic CDN load).
   *
   * If Tabulator isn't already loaded, we inject a <script> tag from
   * CDN before creating the instance — works in Cognos with no
   * index.html script tags.
   */
  class DetailTable {
    constructor(domNode, eventBus) {
      this._node = domNode;
      this._bus = eventBus;
      this._table = null;
      this._data = [];
      this._loading = false;
    }

    _columns() {
      return [
        { title: "Project Nr",    field: "Project_nummer",             width: 120 },
        { title: "Project Naam",  field: "Project_naam_nummer",        width: 200 },
        { title: "Jaar",          field: "Jaar",                       width: 65,  hozAlign: "center" },
        { title: "Event",         field: "Gebeurtenis_code",           width: 65,  hozAlign: "center" },
        { title: "Opbrengsten",   field: "Restbudget_opbrengsten",     width: 120, hozAlign: "right", formatter: fmtEuro },
        { title: "Kosten",        field: "Restbudget_kosten",          width: 120, hozAlign: "right", formatter: fmtEuro },
        { title: "Res. Neming",   field: "Restbudget_resultaatneming", width: 120, hozAlign: "right", formatter: fmtEuro },
        { title: "Lopend Totaal", field: "Lopend_totaal",              width: 130, hozAlign: "right", formatter: fmtEuroBold }
      ];
    }

    async setData(rows) {
      console.log("[DetailTable] setData:", rows ? rows.length : 0, "rows");
      this._data = rows;

      if (!this._node) return;

      // Already created — just swap data
      if (this._table) {
        this._table.replaceData(rows);
        return;
      }

      // Ensure Tabulator is loaded (dynamic CDN injection)
      var ok = await this._loadTabulator();
      if (!ok) {
        console.warn("[DetailTable] Tabulator unavailable — using HTML fallback");
        this._renderFallback(rows);
        return;
      }

      console.log("[DetailTable] Creating Tabulator…");
      try {
        this._table = new Tabulator(this._node, {
          data: rows,
          columns: this._columns(),
          layout: "fitData",
          pagination: true,
          paginationSize: 15,
          paginationSizeSelector: [10, 15, 25, 50],
          initialSort: [{ column: "Jaar", dir: "desc" }]
        });
        console.log("[DetailTable] Tabulator created");

        var self = this;
        this._table.on("rowClick", function (_e, row) {
          var d = row.getData();
          self._bus.emit("table:selection", {
            Jaar: [Number(d.Jaar)],
            Project_nummer: [d.Project_nummer]
          });
        });

      } catch (err) {
        console.error("[DetailTable] Tabulator creation failed:", err.message);
        this._renderFallback(rows);
      }
    }

    /**
     * Load Tabulator dynamically from CDN if not already available.
     * Returns true if Tabulator global is ready.
     */
    async _loadTabulator() {
      if (typeof Tabulator !== "undefined") {
        console.log("[DetailTable] Tabulator already loaded");
        return true;
      }

      if (this._loading) {
        for (var i = 0; i < 50; i++) {
          await sleep(200);
          if (typeof Tabulator !== "undefined") return true;
        }
        return false;
      }

      this._loading = true;
      console.log("[DetailTable] Loading Tabulator from CDN…");

      // The UMD build has a define() call that Cognos's RequireJS intercepts
      // as an anonymous module → "Mismatched anonymous define()" error.
      //
      // Fix: fetch the script as text, temporarily hide define from RequireJS,
      // eval the code, then restore define. Tabulator falls back to setting
      // window.Tabulator since define() is no longer detected.
      try {
        var resp = await fetch(
          "https://unpkg.com/tabulator-tables@5.5.0/dist/js/tabulator.min.js"
        );
        if (!resp.ok) throw new Error("HTTP " + resp.status);
        var code = await resp.text();

        // Temporarily neuter RequireJS's define detection
        var _define = window.define;
        var _defineAmd = _define ? _define.amd : undefined;
        window.define = undefined;

        try {
          eval(code);
        } finally {
          // Restore RequireJS
          window.define = _define;
          if (_defineAmd !== undefined) {
            try { window.define.amd = _defineAmd; } catch (_e) {}
          }
        }

        if (typeof Tabulator !== "undefined") {
          console.log("[DetailTable] Tabulator loaded (define-bypass)");
          return true;
        }
      } catch (e) {
        console.error("[DetailTable] Tabulator load failed:", e.message);
      }

      return false;
    }

    /**
     * Fallback plain HTML table when Tabulator can't load.
     */
    _renderFallback(rows) {
      var cols = this._columns();
      var h = '<table style="width:100%;border-collapse:collapse;font-size:12px;">';
      h += "<tr>";
      for (var c = 0; c < cols.length; c++) {
        h += '<th style="border:1px solid #ddd;padding:8px;background:#f5f5f5;text-align:left;">' + cols[c].title + "</th>";
      }
      h += "</tr>";
      var max = Math.min(rows.length, 50);
      for (var r = 0; r < max; r++) {
        h += "<tr>";
        for (var c2 = 0; c2 < cols.length; c2++) {
          var v = rows[r][cols[c2].field];
          h += '<td style="border:1px solid #eee;padding:6px;">' + (v != null ? v : "") + "</td>";
        }
        h += "</tr>";
      }
      h += "</table>";
      if (rows.length > 50) {
        h += '<p style="color:#999;font-size:11px;padding:8px;">Toont 50 van ' + rows.length + " rijen</p>";
      }
      this._node.innerHTML = h;
    }
  }

  // ─── Formatters ───────────────────────────────────────────────

  function fmtEuro(cell) {
    var v = cell.getValue();
    if (v == null || isNaN(v)) return "";
    var n = Number(v);
    var c = n >= 0 ? "#2d8a4e" : "#d94141";
    return '<span style="color:' + c + '">€ ' + n.toLocaleString("nl-NL") + "</span>";
  }

  function fmtEuroBold(cell) {
    var v = cell.getValue();
    if (v == null || isNaN(v)) return "";
    var n = Number(v);
    var c = n >= 0 ? "#1a237e" : "#d94141";
    return '<span style="color:' + c + ';font-weight:600">€ ' + n.toLocaleString("nl-NL") + "</span>";
  }

  function sleep(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  return DetailTable;
});

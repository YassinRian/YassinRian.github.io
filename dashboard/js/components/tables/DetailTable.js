define([], function () {
  "use strict";

  /**
   * DetailTable — Tabulator-powered data table component.
   *
   * Features:
   *   - Sorting, filtering, pagination (built-in Tabulator)
   *   - Row selection emits "table:selection" for cross-filtering
   *   - Column formatting (currency, dates)
   *   - Responsive layout
   */
  function DetailTable(domNode, eventBus) {
    this._node = domNode;
    this._bus = eventBus;
    this._table = null;
    this._data = [];
  }

  /**
   * Define columns with formatters.
   */
  DetailTable.prototype._getColumns = function () {
    var self = this;
    return [
      {
        title: "Project Nr",
        field: "Project_nummer",
        frozen: true,
        width: 130,
        headerFilter: "input"
      },
      {
        title: "Project Naam",
        field: "Project_naam_nummer",
        width: 220,
        headerFilter: "input"
      },
      {
        title: "Jaar",
        field: "Jaar",
        width: 70,
        hozAlign: "center",
        headerFilter: "number",
        headerFilterFunc: "="
      },
      {
        title: "Datum Event",
        field: "Datum_event",
        width: 150,
        formatter: function (cell) {
          var v = cell.getValue();
          if (!v) return "";
          try {
            return new Date(v).toLocaleDateString("nl-NL");
          } catch (e) {
            return v;
          }
        }
      },
      {
        title: "Event",
        field: "Gebeurtenis_code",
        width: 70,
        hozAlign: "center",
        headerFilter: "list"
      },
      {
        title: "Opbrengsten",
        field: "Restbudget_opbrengsten",
        width: 120,
        hozAlign: "right",
        formatter: formatEuro,
        headerFilter: "number",
        headerFilterFunc: ">="
      },
      {
        title: "Kosten",
        field: "Restbudget_kosten",
        width: 120,
        hozAlign: "right",
        formatter: formatEuro,
        headerFilter: "number",
        headerFilterFunc: "<="
      },
      {
        title: "Res. Neming",
        field: "Restbudget_resultaatneming",
        width: 120,
        hozAlign: "right",
        formatter: formatEuro
      },
      {
        title: "Lopend Totaal",
        field: "Lopend_totaal",
        width: 130,
        hozAlign: "right",
        formatter: formatEuroBold
      }
    ];
  };

  /**
   * Set or replace all data in the table.
   */
  DetailTable.prototype.setData = function (rows) {
    this._data = rows;

    if (this._table) {
      // Efficient in-place replacement (keeps column defs + state)
      this._table.replaceData(rows);
    } else {
      this._table = new Tabulator(this._node, {
        data: rows,
        columns: this._getColumns(),
        layout: "fitDataStretch",
        height: "400px",
        selectable: true,
        selectableRangeMode: "click",
        pagination: true,
        paginationSize: 15,
        paginationSizeSelector: [10, 15, 25, 50],
        initialSort: [{ column: "Jaar", dir: "desc" }]
      });

      // Row selection → emit for cross-filtering
      var self = this;
      this._table.on("rowClick", function (e, row) {
        var data = row.getData();
        self._bus.emit("table:selection", {
          Jaar: [Number(data.Jaar)],
          Project_nummer: [data.Project_nummer]
        });
      });
    }
  };

  /**
   * Get currently visible data (respects Tabulator filters).
   */
  DetailTable.prototype.getVisibleData = function () {
    if (!this._table) return [];
    return this._table.getData("active");
  };

  // ─── FORMATTERS ─────────────────────────────────────────────────

  function formatEuro(cell) {
    var v = cell.getValue();
    if (v == null || isNaN(v)) return "";
    var n = Number(v);
    var cls = n >= 0 ? "color: #2d8a4e" : "color: #d94141";
    return '<span style="' + cls + '">€ ' + n.toLocaleString("nl-NL") + "</span>";
  }

  function formatEuroBold(cell) {
    var v = cell.getValue();
    if (v == null || isNaN(v)) return "";
    var n = Number(v);
    var cls = n >= 0 ? "color: #1a237e; font-weight: 600" : "color: #d94141; font-weight: 600";
    return '<span style="' + cls + '">€ ' + n.toLocaleString("nl-NL") + "</span>";
  }

  return DetailTable;
});

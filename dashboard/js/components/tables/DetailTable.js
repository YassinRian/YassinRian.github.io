define([], function () {
  "use strict";

  /**
   * DetailTable — Zero-dependency sortable, pageable data table.
   *
   * Features:
   *   - Click header to sort (asc → desc → none)
   *   - Pagination with page-size selector
   *   - Column resize via drag handle
   *   - Currency/number formatting
   *   - Row click → cross-filter event
   */
  class DetailTable {
    constructor(domNode, eventBus) {
      this._node = domNode;
      this._bus = eventBus;
      this._rows = [];
      this._cols = null;
      this._sortCol = null;
      this._sortDir = "asc";
      this._page = 0;
      this._pageSize = 15;
      this._resizeCol = null;
      this._resizeStartX = 0;
      this._resizeStartW = 0;
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onMouseUp = this._onMouseUp.bind(this);
      this._injectCSS();
    }

    // ═══════════════════════════════════════════════════════════
    // PUBLIC
    // ═══════════════════════════════════════════════════════════

    setData(rows) {
      this._rows = rows || [];
      this._page = 0;
      this._cols = this._cols || this._buildColumns();
      this._render();
    }

    // ═══════════════════════════════════════════════════════════
    // COLUMNS
    // ═══════════════════════════════════════════════════════════

    _buildColumns() {
      return [
        { field: "Project_nummer",             title: "Project Nr",   w: 120, align: "left" },
        { field: "Project_naam_nummer",        title: "Project Naam", w: 200, align: "left" },
        { field: "Jaar",                       title: "Jaar",         w: 65,  align: "center" },
        { field: "Gebeurtenis_code",           title: "Event",        w: 60,  align: "center" },
        { field: "Restbudget_opbrengsten",     title: "Opbrengsten",  w: 120, align: "right", fmt: "euro" },
        { field: "Restbudget_kosten",          title: "Kosten",       w: 120, align: "right", fmt: "euro" },
        { field: "Restbudget_resultaatneming", title: "Res. Neming",  w: 120, align: "right", fmt: "euro" },
        { field: "Lopend_totaal",              title: "Lopend Totaal",w: 130, align: "right", fmt: "euroBold" }
      ];
    }

    // ═══════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════

    _render() {
      var sorted = this._sortedRows();
      var total = sorted.length;
      var totalPages = Math.ceil(total / this._pageSize);
      var pageRows = sorted.slice(this._page * this._pageSize, (this._page + 1) * this._pageSize);
      var cols = this._cols;

      var h = '<div class="dt-wrap">';
      h += '<table class="dt-table" style="width:100%">';

      // Header
      h += "<thead><tr>";
      for (var c = 0; c < cols.length; c++) {
        var col = cols[c];
        var sortIcon = "";
        if (this._sortCol === c) {
          sortIcon = this._sortDir === "asc" ? " ▴" : " ▾";
        }
        h += '<th class="dt-th" data-col="' + c + '" style="width:' + col.w + 'px;text-align:' + col.align + '">';
        h += '<span class="dt-th-title">' + col.title + sortIcon + "</span>";
        h += '<span class="dt-resize" data-col="' + c + '"></span>';
        h += "</th>";
      }
      h += "</tr></thead>";

      // Body
      h += "<tbody>";
      for (var r = 0; r < pageRows.length; r++) {
        h += '<tr class="dt-row" data-row="' + r + '">';
        for (var c2 = 0; c2 < cols.length; c2++) {
          var col2 = cols[c2];
          var val = pageRows[r][col2.field];
          h += '<td class="dt-cell" style="text-align:' + col2.align + '">' +
            this._formatVal(val, col2.fmt) + "</td>";
        }
        h += "</tr>";
      }
      if (pageRows.length === 0) {
        h += '<tr><td class="dt-cell" colspan="' + cols.length +
          '" style="text-align:center;padding:40px;color:#999;">Geen gegevens</td></tr>';
      }
      h += "</tbody>";
      h += "</table>";

      // Footer
      h += '<div class="dt-foot">';
      h += '<span class="dt-count">' + total + " rijen</span>";
      h += '<div class="dt-pager">';
      h += '<span class="dt-page-label">Rijen per pagina:</span>';
      h += '<select class="dt-select">';
      [10, 15, 25, 50].forEach(function (n) {
        h += '<option value="' + n + '"' + (n === this._pageSize ? " selected" : "") + ">" + n + "</option>";
      }, this);
      h += "</select>";
      h += '<button class="dt-btn' + (this._page === 0 ? " dt-btn-disabled" : "") + '" data-action="first">««</button>';
      h += '<button class="dt-btn' + (this._page === 0 ? " dt-btn-disabled" : "") + '" data-action="prev">«</button>';
      h += '<span class="dt-page-info">' + (this._page + 1) + " / " + (totalPages || 1) + "</span>";
      h += '<button class="dt-btn' + (this._page >= totalPages - 1 ? " dt-btn-disabled" : "") + '" data-action="next">»</button>';
      h += '<button class="dt-btn' + (this._page >= totalPages - 1 ? " dt-btn-disabled" : "") + '" data-action="last">»»</button>';
      h += "</div></div>";
      h += "</div>";

      this._node.innerHTML = h;
      this._wireEvents();
    }

    _sortedRows() {
      if (this._sortCol === null) return this._rows.slice();
      var col = this._cols[this._sortCol];
      var field = col.field;
      var dir = this._sortDir === "asc" ? 1 : -1;
      return this._rows.slice().sort(function (a, b) {
        var va = a[field], vb = b[field];
        if (va == null) va = "";
        if (vb == null) vb = "";
        if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
        return String(va).localeCompare(String(vb)) * dir;
      });
    }

    // ═══════════════════════════════════════════════════════════
    // FORMAT
    // ═══════════════════════════════════════════════════════════

    _formatVal(val, fmt) {
      if (val == null || val === "") return "";
      if (fmt === "euro" || fmt === "euroBold") {
        var n = Number(val);
        if (isNaN(n)) return val;
        var cls = n >= 0 ? "dt-green" : "dt-red";
        if (fmt === "euroBold") cls += " dt-bold";
        return '<span class="' + cls + '">€ ' + n.toLocaleString("nl-NL") + "</span>";
      }
      return String(val);
    }

    // ═══════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════

    _wireEvents() {
      var self = this;

      // Sort on header click
      this._node.querySelectorAll(".dt-th").forEach(function (th) {
        th.addEventListener("click", function (e) {
          if (e.target.classList.contains("dt-resize")) return;
          var c = parseInt(th.getAttribute("data-col"));
          if (self._sortCol === c) {
            self._sortDir = self._sortDir === "asc" ? "desc" : self._sortDir === "desc" ? null : "asc";
            if (self._sortDir === null) self._sortCol = null;
          } else {
            self._sortCol = c;
            self._sortDir = "asc";
          }
          self._page = 0;
          self._render();
        });
      });

      // Row click → cross-filter
      this._node.querySelectorAll(".dt-row").forEach(function (tr) {
        tr.addEventListener("click", function () {
          var idx = parseInt(tr.getAttribute("data-row"));
          var sorted = self._sortedRows();
          var row = sorted[self._page * self._pageSize + idx];
          if (row) {
            self._bus.emit("table:selection", {
              Jaar: [Number(row.Jaar)],
              Project_nummer: [row.Project_nummer]
            });
          }
        });
      });

      // Pagination buttons
      this._node.querySelectorAll(".dt-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var action = btn.getAttribute("data-action");
          var total = Math.ceil(self._rows.length / self._pageSize);
          if (action === "first") self._page = 0;
          if (action === "prev")  self._page = Math.max(0, self._page - 1);
          if (action === "next")  self._page = Math.min(total - 1, self._page + 1);
          if (action === "last")  self._page = total - 1;
          self._render();
        });
      });

      // Page size
      var sel = this._node.querySelector(".dt-select");
      if (sel) {
        sel.addEventListener("change", function () {
          self._pageSize = parseInt(sel.value);
          self._page = 0;
          self._render();
        });
      }

      // Column resize
      this._node.querySelectorAll(".dt-resize").forEach(function (handle) {
        handle.addEventListener("mousedown", function (e) {
          e.preventDefault();
          e.stopPropagation();
          var c = parseInt(handle.getAttribute("data-col"));
          self._resizeCol = self._cols[c];
          self._resizeStartX = e.clientX;
          self._resizeStartW = self._resizeCol.w;
          document.addEventListener("mousemove", self._onMouseMove);
          document.addEventListener("mouseup", self._onMouseUp);
        });
      });
    }

    _onMouseMove(e) {
      if (!this._resizeCol) return;
      var diff = e.clientX - this._resizeStartX;
      this._resizeCol.w = Math.max(40, this._resizeStartW + diff);
      // Update header width live
      var th = this._node.querySelector('.dt-th[data-col="' +
        this._cols.indexOf(this._resizeCol) + '"]');
      if (th) th.style.width = this._resizeCol.w + "px";
    }

    _onMouseUp() {
      document.removeEventListener("mousemove", this._onMouseMove);
      document.removeEventListener("mouseup", this._onMouseUp);
      this._resizeCol = null;
      this._render(); // re-render with new widths
    }

    // ═══════════════════════════════════════════════════════════
    // CSS (self-contained — no external stylesheet needed)
    // ═══════════════════════════════════════════════════════════

    _injectCSS() {
      if (document.getElementById("dt-css")) return;
      var css = [
        ".dt-wrap{font-size:13px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}",
        ".dt-table{width:100%;border-collapse:collapse;table-layout:fixed}",
        ".dt-th{position:relative;background:#e8eaf6;color:#1a237e;font-weight:600;padding:10px 8px;border-bottom:2px solid #1a237e;cursor:pointer;user-select:none;white-space:nowrap;overflow:hidden}",
        ".dt-th:hover{background:#c5cae9}",
        ".dt-th-title{pointer-events:none}",
        ".dt-resize{position:absolute;top:0;right:0;bottom:0;width:6px;cursor:col-resize;z-index:1}",
        ".dt-resize:hover{background:rgba(26,35,126,0.15)}",
        ".dt-cell{padding:7px 8px;border-bottom:1px solid #eee;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
        ".dt-row{cursor:pointer;transition:background 0.1s}",
        ".dt-row:hover{background:#f0f4ff}",
        ".dt-row:nth-child(even){background:#fafafa}",
        ".dt-row:nth-child(even):hover{background:#f0f4ff}",
        ".dt-green{color:#2d8a4e}",
        ".dt-red{color:#d94141}",
        ".dt-bold{font-weight:600}",
        ".dt-foot{display:flex;align-items:center;justify-content:space-between;padding:10px 8px;border-top:1px solid #e0e0e0;background:#fafafa;font-size:12px;color:#666}",
        ".dt-pager{display:flex;align-items:center;gap:4px}",
        ".dt-btn{padding:3px 8px;border:1px solid #ccc;border-radius:3px;background:#fff;cursor:pointer;font-size:12px}",
        ".dt-btn:hover:not(.dt-btn-disabled){background:#e8eaf6}",
        ".dt-btn-disabled{opacity:0.4;cursor:default}",
        ".dt-select{padding:3px 4px;border:1px solid #ccc;border-radius:3px;font-size:12px}",
        ".dt-page-info{font-weight:600;color:#333}",
        ".dt-page-label{margin-right:4px}"
      ].join("\n");
      var style = document.createElement("style");
      style.id = "dt-css";
      style.textContent = css;
      document.head.appendChild(style);
    }
  }

  return DetailTable;
});

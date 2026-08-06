define([], function () {
  "use strict";

  /**
   * DashboardLayout — DOM skeleton for Project 364 dashboard.
   *
   * Mount points exposed:
   *   .kpiContainer        — top KPI card row
   *   .filterContainer     — filter bar (year range, project selector)
   *   .chartContainer      — ECharts projection chart
   *   .tableContainer      — Tabulator detail table
   *   .breadcrumbContainer — active filter breadcrumbs
   */
  function DashboardLayout(container) {
    this.container = container;
    this.kpiContainer = null;
    this.filterContainer = null;
    this.chartContainer = null;
    this.tableContainer = null;
    this.breadcrumbContainer = null;
  }

  DashboardLayout.prototype.render = function () {
    this.container.innerHTML = [
      '<div class="dashboard-wrapper">',

      // Header
      '  <div class="dashboard-header">',
      '    <h1 class="dashboard-title">Project 364 — Financiële Prognose</h1>',
      '    <div class="dashboard-actions">',
      '      <span class="dashboard-status" id="status-text"></span>',
      '    </div>',
      '  </div>',

      // KPI Row
      '  <div id="kpi-area"></div>',

      // Filter Bar
      '  <div id="filter-bar" class="dashboard-filters">',
      '    <div class="filter-group">',
      '      <span class="filter-label">Jaar</span>',
      '      <select id="filter-jaar" class="filter-select" multiple size="4">',
      '        <option value="">— Laden… —</option>',
      '      </select>',
      '    </div>',
      '    <div class="filter-group">',
      '      <span class="filter-label">Project</span>',
      '      <select id="filter-project" class="filter-select" multiple size="4">',
      '        <option value="">— Laden… —</option>',
      '      </select>',
      '    </div>',
      '    <div class="filter-group" style="justify-content: flex-end;">',
      '      <button id="btn-reset-filters" class="btn-reset-filters" style="margin-top: 18px;">✕ Filters wissen</button>',
      '    </div>',
      '  </div>',

      // Breadcrumbs
      '  <div class="dashboard-breadcrumb" id="breadcrumb"></div>',

      // Chart Panel
      '  <div class="chart-panel">',
      '    <div class="chart-panel-header">Financiële Projectie per Jaar</div>',
      '    <div class="chart-panel-body">',
      '      <div id="chart-area"></div>',
      '    </div>',
      '  </div>',

      // Table Panel
      '  <div class="dashboard-table" id="table-area">',
      '    <div class="table-header">',
      '      <span>Detailgegevens</span>',
      '      <span class="table-count" id="table-row-count"></span>',
      '    </div>',
      '    <div id="table-mount" style="min-height: 300px;"></div>',
      '  </div>',

      '</div>'
    ].join("\n");

    // Cache mount points
    this.kpiContainer       = this.container.querySelector("#kpi-area");
    this.filterContainer    = this.container.querySelector("#filter-bar");
    this.chartContainer     = this.container.querySelector("#chart-area");
    this.tableContainer     = this.container.querySelector("#table-mount");
    this.breadcrumbContainer = this.container.querySelector("#breadcrumb");

    return this;
  };

  /**
   * Populate the Jaar multi-select filter dropdown.
   */
  DashboardLayout.prototype.setJaarOptions = function (years) {
    var sel = this.container.querySelector("#filter-jaar");
    if (!sel) return;
    sel.innerHTML = years.map(function (y) {
      return '<option value="' + y + '">' + y + "</option>";
    }).join("");
  };

  /**
   * Populate the Project multi-select filter dropdown.
   */
  DashboardLayout.prototype.setProjectOptions = function (projects) {
    var sel = this.container.querySelector("#filter-project");
    if (!sel) return;
    sel.innerHTML = projects.map(function (p) {
      var short = p.length > 40 ? p.substring(0, 38) + "…" : p;
      return '<option value="' + p + '">' + short + "</option>";
    }).join("");
  };

  /**
   * Update the table row count badge.
   */
  DashboardLayout.prototype.setRowCount = function (n) {
    var el = this.container.querySelector("#table-row-count");
    if (el) el.textContent = n + " rijen";
  };

  /**
   * Update breadcrumb showing active filters.
   */
  DashboardLayout.prototype.updateBreadcrumb = function (filters) {
    if (!this.breadcrumbContainer) return;
    var active = Object.keys(filters).filter(function (k) {
      return filters[k] && filters[k].length > 0;
    });

    if (active.length === 0) {
      this.breadcrumbContainer.innerHTML =
        '<span style="color:#999; font-size:12px;">Alle data getoond — klik op een grafiek of tabelrij om te filteren</span>';
      return;
    }

    var crumbs = active.map(function (dim) {
      var vals = filters[dim];
      var label = vals.length === 1 ? String(vals[0]) : vals.length + " geselecteerd";
      return '<span class="breadcrumb-item">' + dim + ': <strong>' + label + "</strong></span>";
    });

    this.breadcrumbContainer.innerHTML = [
      '<div class="breadcrumb-trail">',
      '  <span class="breadcrumb-home">Alles</span>',
      crumbs.map(function (c) { return '<span class="breadcrumb-sep">›</span>' + c; }).join(""),
      "</div>"
    ].join("\n");
  };

  // ─── LOADING OVERLAY (reused from existing) ─────────────────────

  DashboardLayout.prototype.showLoading = function (message) {
    var overlay = document.createElement("div");
    overlay.className = "dashboard-loading";
    overlay.innerHTML =
      '<div class="loading-spinner"></div><span>' + (message || "Loading...") + "</span>";
    this.container.appendChild(overlay);
  };

  DashboardLayout.prototype.hideLoading = function () {
    var overlay = this.container.querySelector(".dashboard-loading");
    if (overlay) overlay.remove();
  };

  return DashboardLayout;
});

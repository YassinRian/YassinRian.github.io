define([
  "./core/EventBus.js",
  "./core/FilterState.js",
  "./core/Config.js",
  "./data/DataEngine.js",
  "./data/CognosDataConnector.js",
  "./model/DashboardModel.js",
  "./layout/DashboardLayout.js",
  "./utils/Styles.js",
  "./utils/dom.js",
  "./components/charts/ProjectionChart.js",
  "./components/tables/DetailTable.js",
  "./components/kpi/KPICards.js"
], function (
  EventBus,
  FilterState,
  Config,
  DataEngine,
  CognosDataConnector,
  DashboardModel,
  DashboardLayout,
  Styles,
  dom,
  ProjectionChart,
  DetailTable,
  KPICards
) {
  "use strict";

  console.log("[App] Module loaded");

  /**
   * App — Cognos Custom Control lifecycle + cross-filtering orchestrator.
   *
   * Lifecycle:
   *   1. Cognos calls setData(oControlHost, oData) — once per dataset
   *   2. Cognos calls draw(oControlHost) — initialise & render
   *
   * Cross-filtering:
   *   chart:click  → FilterState.toggle("Jaar", year) → re-query model → all views update
   *   table:click  → FilterState.set("Project_nummer", [...]) → re-query → all views update
   *   filter bar   → FilterState.set(dim, selectedValues) → re-query → all views update
   *   reset button → FilterState.clearAll() → re-query → all views update
   */
  function App() {
    this.eventBus        = new EventBus();
    this.filterState     = new FilterState(this.eventBus);
    this.dataEngine      = new DataEngine();
    this.cognosConnector = new CognosDataConnector();
    this.model           = new DashboardModel(this.dataEngine);
    this.layout          = null;
    this.projectionChart = null;
    this.detailTable     = null;
    this.kpiCards        = null;
    this._datasetName    = null;
    this._initialised    = false;
  }

  // ═══════════════════════════════════════════════════════════════
  // COGNOS LIFECYCLE
  // ═══════════════════════════════════════════════════════════════

  App.prototype.setData = function (oControlHost, dataStore, name) {
    console.log("[App] setData called:", name || dataStore.name);
    var dsName = name || dataStore.name || dataStore._7rn ||
      "dataset_" + (this.cognosConnector.getNames().length + 1);
    this.cognosConnector.register(dsName, dataStore);
    this.oControlHost = oControlHost;
  };

  App.prototype.draw = async function (oControlHost) {
    console.log("[App] draw() called");
    this.oControlHost = oControlHost;

    Styles.inject();
    dom.initHtm(); // preload htm (non-blocking)

    // ── Layout ───────────────────────────────────────────────
    this.layout = new DashboardLayout(oControlHost.container);
    this.layout.render();
    this.layout.showLoading("DuckDB initialiseren…");

    try {
      // ── DuckDB + Ingest ────────────────────────────────────
      await this.dataEngine.initialize();
      console.log("[App] DuckDB ready");

      var dsNames = this.cognosConnector.getNames();
      console.log("[App] Datasets:", dsNames);

      for (var i = 0; i < dsNames.length; i++) {
        var dsName = dsNames[i];
        var rows = this.cognosConnector.toRows(dsName);
        if (rows.length > 0) {
          await this.dataEngine.ingest(dsName, rows);
        }
      }

      // Register the primary table with column mappings.
      // The first Cognos dataset is assumed to be the primary
      // project-financials star schema.
      this._datasetName = dsNames[0];
      this.model.registerTable(this._datasetName, {
        primary: true,
        columns: {
          year:           "Jaar",
          revenue:         "Restbudget_opbrengsten",
          cost:            "Restbudget_kosten",
          resultaatneming: "Restbudget_resultaatneming",
          runningTotal:    "Lopend_totaal",
          projectCode:     "Project_nummer",
          projectName:     "Project_naam_nummer",
          eventDate:       "Datum_event",
          eventCode:       "Gebeurtenis_code"
        }
      });

      // Additional datasets get registered without "primary: true".
      // Their column mappings are defined when the star schema is added.
      for (var k = 1; k < dsNames.length; k++) {
        this.model.registerTable(dsNames[k], {
          columns: {} // filled in when the schema is known
        });
        console.log("[App] Secondary table registered:", dsNames[k]);
      }

      // ── Wire Components ────────────────────────────────────
      this.kpiCards = new KPICards(this.layout.kpiContainer);

      this.projectionChart = new ProjectionChart(
        this.layout.chartContainer,
        this.eventBus
      );

      this.detailTable = new DetailTable(
        this.layout.tableContainer,
        this.eventBus
      );

      // ── Populate Filter Dropdowns ──────────────────────────
      await this._populateFilterOptions();

      // ── Subscribe to Events ────────────────────────────────
      this._wireEvents();

      // ── Initial Render ─────────────────────────────────────
      this.layout.hideLoading();
      await this._refreshAll();

      this._initialised = true;
      console.log("[App] Dashboard ready!");

    } catch (err) {
      this.layout.hideLoading();
      console.error("[App] Fatal error:", err);
      oControlHost.container.innerHTML +=
        '<div style="padding:20px;color:#d94141;font-weight:bold;">' +
        "Fout: " + err.message + "</div>";
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // EVENT WIRING (cross-filtering)
  // ═══════════════════════════════════════════════════════════════

  App.prototype._wireEvents = function () {
    var self = this;

    // Chart click → toggle Jaar filter
    this.eventBus.on("chart:selection", function (payload) {
      if (payload && payload.dimension === "JAAR" && payload.values) {
        for (var i = 0; i < payload.values.length; i++) {
          // Normalize to number — chart click returns strings
          self.filterState.toggle("Jaar", Number(payload.values[i]));
        }
      }
    });

    // Table row click → set Project filter + Jaar filter
    this.eventBus.on("table:selection", function (payload) {
      if (payload) {
        if (payload.Project_nummer) {
          self.filterState.set("Project_nummer", payload.Project_nummer);
        }
        if (payload.Jaar) {
          // Jaar from Tabulator data may be string or number; normalise
          var jaarVals = payload.Jaar.map(function (v) { return Number(v); });
          self.filterState.set("Jaar", jaarVals);
        }
      }
    });

    // Filter dropdowns changed
    var filterJaar = this.layout.container.querySelector("#filter-jaar");
    var filterProject = this.layout.container.querySelector("#filter-project");

    if (filterJaar) {
      filterJaar.addEventListener("change", function () {
        var selected = getSelectValues(filterJaar);
        // Select values are always strings; convert to numbers
        var nums = selected.map(function (v) { return Number(v); });
        self.filterState.set("Jaar", nums.length > 0 ? nums : null);
      });
    }

    if (filterProject) {
      filterProject.addEventListener("change", function () {
        var selected = getSelectValues(filterProject);
        self.filterState.set("Project_nummer", selected.length > 0 ? selected : null);
      });
    }

    // Reset button
    var btnReset = this.layout.container.querySelector("#btn-reset-filters");
    if (btnReset) {
      btnReset.addEventListener("click", function () {
        self.filterState.clearAll();
      });
    }

    // Core cross-filter loop: filter change → re-query → re-render
    this.eventBus.on("filters:changed", function () {
      self._refreshAll();
    });
  };

  // ═══════════════════════════════════════════════════════════════
  // REFRESH ALL VIEWS
  // ═══════════════════════════════════════════════════════════════

  App.prototype._refreshAll = async function () {
    var filters = this.filterState.get();
    console.log("[App] Refreshing with filters:", filters);

    // Run all three queries in parallel
    var projectionPromise = this.model.getProjectionByYear(filters);
    var kpiPromise        = this.model.getKPIs(filters);
    var detailPromise     = this.model.getDetailTable(filters);

    var projectionData, kpiData, detailData;
    try { projectionData = await projectionPromise; } catch (e) { console.error("[App] Projection query failed:", e); }
    try { kpiData        = await kpiPromise;        } catch (e) { console.error("[App] KPI query failed:", e); }
    try { detailData     = await detailPromise;     } catch (e) { console.error("[App] Detail query failed:", e); }

    // Update each view independently — one failure won't block the others
    if (projectionData) {
      try { this.projectionChart.update(projectionData); } catch (e) { console.error("[App] Chart update failed:", e); }
    }
    if (kpiData) {
      try { this.kpiCards.update(kpiData); } catch (e) { console.error("[App] KPI update failed:", e); }
    }
    if (detailData) {
      try { this.layout.setRowCount(detailData.length); } catch (e) {}
      try { this.detailTable.setData(detailData); } catch (e) { console.error("[App] Table update failed:", e); }
    }

    // Breadcrumb — pass clear-callback so clicks remove individual filters
    var self = this;
    try {
      this.layout.updateBreadcrumb(filters, function (dim) {
        if (!dim) {
          self.filterState.clearAll();
        } else {
          self.filterState.clear(dim);
        }
      });
    } catch (e) { console.error("[App] Breadcrumb update failed:", e); }

    // Sync filter dropdown highlights
    try { this._syncDropdowns(filters); } catch (e) { console.error("[App] Dropdown sync failed:", e); }
  };

  // ═══════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════

  App.prototype._populateFilterOptions = async function () {
    try {
      var years = await this.model.getFilterOptions("Jaar");
      this.layout.setJaarOptions(years);

      // Use Project_nummer (codes) as filter dimension, consistent with table row clicks
      var projects = await this.model.getFilterOptions("Project_nummer");
      this.layout.setProjectOptions(projects);
    } catch (err) {
      console.warn("[App] Could not load filter options:", err);
    }
  };

  App.prototype._syncDropdowns = function (filters) {
    syncSelectValues(this.layout.container.querySelector("#filter-jaar"),
      filters.Jaar || []);
    syncSelectValues(this.layout.container.querySelector("#filter-project"),
      filters.Project_nummer || []);
  };

  App.prototype.destroy = function () {
    console.log("[App] Destroying…");
    if (this.projectionChart) this.projectionChart.dispose();
    if (this.dataEngine) this.dataEngine.close();
  };

  // ─── Static Helpers ────────────────────────────────────────────

  function getSelectValues(select) {
    var result = [];
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].selected) {
        result.push(select.options[i].value);
      }
    }
    return result;
  }

  function syncSelectValues(select, values) {
    if (!select) return;
    // Convert both sides to strings — filter values may be numbers,
    // but HTML option values are always strings
    var strVals = values.map(function (v) { return String(v); });
    for (var i = 0; i < select.options.length; i++) {
      select.options[i].selected = strVals.indexOf(select.options[i].value) >= 0;
    }
  }

  return App;
});

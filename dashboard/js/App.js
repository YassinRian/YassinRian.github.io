define([
  "./core/EventBus.js",
  "./core/StateStore.js",
  "./core/Config.js",
  "./data/DataEngine.js",
  "./data/CognosDataConnector.js",
  "./layout/DashboardLayout.js",
  "./utils/Styles.js",
  "./components/charts/ProjectionChart.js",
], function (
  EventBus,
  StateStore,
  Config,
  DataEngine,
  CognosDataConnector,
  DashboardLayout,
  Styles,
  ProjectionChart,
) {
  "use strict";

  console.log("[App] Module loaded");

  class App {
    constructor() {
      console.log("[App] Constructor called");
      this.eventBus = new EventBus();
      this.stateStore = new StateStore(this.eventBus);
      this.dataEngine = new DataEngine();
      this.cognosConnector = new CognosDataConnector();
      this.layout = null;
      this.projectionChart = null;
      this.initialized = false;
    }

    /**
     * Cognos calls setData() for each data source.
     */
    setData(oControlHost, dataStore, name) {
      console.log("[App] setData called:", name);
      var datasetName = name || dataStore._7rn || "dataset_" + (this.cognosConnector.getNames().length + 1);
      this.cognosConnector.register(datasetName, dataStore);
      this.oControlHost = oControlHost;
    }

    /**
     * Cognos calls draw() after all setData() calls.
     */
    async draw(oControlHost) {
      console.log("[App] draw() called");
      this.oControlHost = oControlHost;

      Styles.inject();

      this.layout = new DashboardLayout(oControlHost.container);
      this.layout.render();
      this.layout.showLoading("Initializing DuckDB...");

      try {
        // Initialize DuckDB
        await this.dataEngine.initialize();
        console.log("[App] DuckDB initialized");

        // Ingest all registered datasets
        var datasetNames = this.cognosConnector.getNames();
        console.log("[App] Datasets to ingest:", datasetNames);

        for (var i = 0; i < datasetNames.length; i++) {
          var dsName = datasetNames[i];
          var rows = this.cognosConnector.toRows(dsName);
          if (rows.length > 0) {
            await this.dataEngine.ingest(dsName, rows);
          }
        }

        // Query aggregated data
        var aggregatedData = await this.getAggregatedData();
        console.log("[App] Aggregated data:", aggregatedData.length, "years");

        this.layout.hideLoading();

        // Initialize Projection Chart
        this.projectionChart = new ProjectionChart(
          this.layout.chartContainer,
          this.eventBus,
        );

        // Render chart
        this.projectionChart.update(aggregatedData);

        // Render summary table
        this.renderSummaryTable(aggregatedData);

        this.initialized = true;
        console.log("[App] Dashboard ready!");
      } catch (err) {
        this.layout.hideLoading();
        console.error("[App] Error:", err);
        oControlHost.container.innerHTML =
          '<div style="padding:40px;color:red;">Error: ' + err.message + "</div>";
      }
    }

    /**
     * Aggregate data by year using DuckDB SQL.
     */
    async getAggregatedData() {
      var datasetName = this.cognosConnector.getNames()[0];
      if (!datasetName) return [];

      var sql =
        "SELECT " +
        "  CAST(Jaar AS INTEGER) as JAAR, " +
        "  SUM(COALESCE(CAST(Restbudget_opbrengsten AS DOUBLE), 0)) as RESTBUDGET_OBRENGSTEN, " +
        "  SUM(COALESCE(CAST(Restbudget_kosten AS DOUBLE), 0)) * -1 as RESTBUDGET__KST_RES, " +
        "  SUM(COALESCE(CAST(Restbudget_resultaatneming AS DOUBLE), 0)) as RESTBUDGET_RESULTAATNEMING, " +
        "  SUM(COALESCE(CAST(Lopend_totaal AS DOUBLE), 0)) as LOPEND_TOTAAL " +
        "FROM \"" + datasetName + "\" " +
        "WHERE Jaar IS NOT NULL " +
        "GROUP BY Jaar " +
        "ORDER BY Jaar";

      console.log("[App] Running aggregation query...");
      var result = await this.dataEngine.query(sql);
      console.log("[App] Aggregation result:", result.length, "rows");

      var rows = result.map(function (row) {
        return {
          JAAR: Number(row.JAAR),
          RESTBUDGET_OBRENGSTEN: Number(row.RESTBUDGET_OBRENGSTEN),
          RESTBUDGET__KST_RES: Number(row.RESTBUDGET__KST_RES),
          RESTBUDGET_RESULTAATNEMING: Number(row.RESTBUDGET_RESULTAATNEMING),
          LOPEND_TOTAAL: Number(row.LOPEND_TOTAAL),
        };
      });

      // Calculate cumulative total
      var cumulative = 0;
      for (var i = 0; i < rows.length; i++) {
        cumulative += rows[i].RESTBUDGET_OBRENGSTEN + rows[i].RESTBUDGET__KST_RES;
        rows[i].CUMULATIEVE_BOEKWAARDE = Math.round(cumulative * 100) / 100;
      }

      return rows;
    }

    /**
     * Render summary table.
     */
    renderSummaryTable(data) {
      var tableContainer = this.layout.tableContainer;
      if (!tableContainer) return;

      var html =
        '<div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">';
      html += '<div style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-weight: 600;">Samenvatting per Jaar</div>';
      html += '<div style="overflow-x: auto;"><table style="border-collapse: collapse; font-size: 12px; width: 100%;">';

      html += "<tr>";
      html += '<th style="border: 1px solid #ddd; padding: 8px; background: #fafafa;">Jaar</th>';
      html += '<th style="border: 1px solid #ddd; padding: 8px; background: #fafafa;">Opbrengsten</th>';
      html += '<th style="border: 1px solid #ddd; padding: 8px; background: #fafafa;">Kosten</th>';
      html += '<th style="border: 1px solid #ddd; padding: 8px; background: #fafafa;">Cumulatief</th>';
      html += "</tr>";

      var maxRows = Math.min(data.length, 20);
      for (var i = 0; i < maxRows; i++) {
        var r = data[i];
        html += "<tr>";
        html += '<td style="border: 1px solid #ddd; padding: 8px;">' + r.JAAR + "</td>";
        html += '<td style="border: 1px solid #ddd; padding: 8px; text-align: right;">\u20AC ' + r.RESTBUDGET_OBRENGSTEN.toLocaleString("nl-NL") + "</td>";
        html += '<td style="border: 1px solid #ddd; padding: 8px; text-align: right;">\u20AC ' + r.RESTBUDGET__KST_RES.toLocaleString("nl-NL") + "</td>";
        html += '<td style="border: 1px solid #ddd; padding: 8px; text-align: right;">\u20AC ' + r.CUMULATIEVE_BOEKWAARDE.toLocaleString("nl-NL") + "</td>";
        html += "</tr>";
      }

      html += "</table></div></div>";
      tableContainer.innerHTML = html;
    }

    destroy() {
      console.log("[App] Destroying...");
      if (this.projectionChart) this.projectionChart.dispose();
      if (this.dataEngine) this.dataEngine.close();
    }
  }

  return App;
});

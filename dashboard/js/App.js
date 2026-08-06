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
     * Flexible: supports multiple datasets via CognosDataConnector.
     */
    setData(oControlHost, dataStore, name) {
      console.log("[App] setData called:", name);

      // Register the dataset with our connector
      var datasetName = name || dataStore.name || "dataset_" + (this.cognosConnector.getNames().length + 1);
      this.cognosConnector.register(datasetName, dataStore);

      // Store oControlHost for later use
      this.oControlHost = oControlHost;
    }

    /**
     * Cognos calls draw() after all setData() calls.
     * This is where we initialize DuckDB and render the dashboard.
     */
    async draw(oControlHost) {
      console.log("[App] draw() called");
      this.oControlHost = oControlHost;

      // 1. Inject styles
      Styles.inject();

      // 2. Create layout
      this.layout = new DashboardLayout(oControlHost.container);
      this.layout.render();
      this.layout.showLoading("Initializing DuckDB...");

      try {
        // 3. Initialize DuckDB
        await this.dataEngine.initialize();
        console.log("[App] DuckDB initialized");

        // 4. Ingest all registered datasets
        var datasetNames = this.cognosConnector.getNames();
        console.log("[App] Datasets to ingest:", datasetNames);

        for (var i = 0; i < datasetNames.length; i++) {
          var dsName = datasetNames[i];
          var rows = this.cognosConnector.toRows(dsName);
          if (rows.length > 0) {
            await this.dataEngine.ingest(dsName, rows);
          }
        }

        // 5. Query aggregated data for projection chart
        var aggregatedData = await this.getAggregatedData();
        console.log("[App] Aggregated data:", aggregatedData.length, "years");

        this.layout.hideLoading();

        // 6. Initialize Projection Chart
        this.projectionChart = new ProjectionChart(
          this.layout.chartContainer,
          this.eventBus,
        );

        // 7. Render chart with aggregated data
        this.projectionChart.update(aggregatedData);

        // 8. Render summary table
        this.renderSummaryTable(aggregatedData);

        this.initialized = true;
        console.log("[App] Dashboard ready!");
      } catch (err) {
        this.layout.hideLoading();
        console.error("[App] Error:", err);
        oControlHost.container.innerHTML =
          '<div style="padding:40px;color:red;">Error: ' +
          err.message +
          "</div>";
      }
    }

    /**
     * Aggregate data by year using DuckDB SQL.
     */
    async getAggregatedData() {
      // Get the first dataset name
      var datasetName = this.cognosConnector.getNames()[0];
      if (!datasetName) {
        console.log("[App] No datasets available");
        return [];
      }

      // Query aggregated data by year
      // Cast VARCHAR columns to DOUBLE for numeric aggregation
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
      console.log("[App] SQL:", sql);
      var result = await this.dataEngine.query(sql);
      console.log("[App] Raw aggregation result:", result);

      var rows = result.map(function (row) {
        return {
          JAAR: Number(row.JAAR),
          RESTBUDGET_OBRENGSTEN: Number(row.RESTBUDGET_OBRENGSTEN),
          RESTBUDGET__KST_RES: Number(row.RESTBUDGET__KST_RES),
          RESTBUDGET_RESULTAATNEMING: Number(row.RESTBUDGET_RESULTAATNEMING),
          LOPEND_TOTAAL: Number(row.LOPEND_TOTAAL),
        };
      });

      console.log("[App] First 3 aggregated rows:", rows.slice(0, 3));

      // Calculate cumulative total
      var cumulative = 0;
      for (var i = 0; i < rows.length; i++) {
        cumulative += rows[i].RESTBUDGET_OBRENGSTEN + rows[i].RESTBUDGET__KST_RES;
        rows[i].CUMULATIEVE_BOEKWAARDE = Math.round(cumulative * 100) / 100;
      }

      console.log("[App] Aggregated " + rows.length + " years");
      return rows;
    }

    /**
     * Render summary table below the chart.
     */
    renderSummaryTable(data) {
      var tableContainer = this.layout.tableContainer;
      if (!tableContainer) return;

      var html =
        '<div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">';
      html +=
        '<div style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-weight: 600;">Samenvatting per Jaar</div>';
      html +=
        '<div style="overflow-x: auto;"><table style="border-collapse: collapse; font-size: 12px; width: 100%;">';

      // Header
      html += "<tr>";
      html += '<th style="border: 1px solid #ddd; padding: 8px; background: #fafafa;">Jaar</th>';
      html += '<th style="border: 1px solid #ddd; padding: 8px; background: #fafafa;">Opbrengsten</th>';
      html += '<th style="border: 1px solid #ddd; padding: 8px; background: #fafafa;">Kosten</th>';
      html += '<th style="border: 1px solid #ddd; padding: 8px; background: #fafafa;">Cumulatief</th>';
      html += "</tr>";

      // Rows (first 20)
      var maxRows = Math.min(data.length, 20);
      for (var i = 0; i < maxRows; i++) {
        var r = data[i];
        html += "<tr>";
        html += '<td style="border: 1px solid #ddd; padding: 8px;">' + r.JAAR + "</td>";
        html +=
          '<td style="border: 1px solid #ddd; padding: 8px; text-align: right;">\u20AC ' +
          r.RESTBUDGET_OBRENGSTEN.toLocaleString("nl-NL") +
          "</td>";
        html +=
          '<td style="border: 1px solid #ddd; padding: 8px; text-align: right;">\u20AC ' +
          r.RESTBUDGET__KST_RES.toLocaleString("nl-NL") +
          "</td>";
        html +=
          '<td style="border: 1px solid #ddd; padding: 8px; text-align: right;">\u20AC ' +
          r.CUMULATIEVE_BOEKWAARDE.toLocaleString("nl-NL") +
          "</td>";
        html += "</tr>";
      }

      html += "</table></div></div>";
      tableContainer.innerHTML = html;
    }

    /**
     * Cleanup when Cognos destroys the control.
     */
    destroy() {
      console.log("[App] Destroying...");
      if (this.projectionChart) this.projectionChart.dispose();
      if (this.dataEngine) this.dataEngine.close();
    }
  }

  return App;
});

define([], function () {
  "use strict";

  /**
   * DashboardModel — Semantic query layer on top of DuckDB.
   *
   * Components never write SQL. They call:
   *   model.getProjectionByYear(filters)
   *   model.getDetailTable(filters)
   *   model.getKPIs(filters)
   *   model.getByProject(filters)
   *   model.getFilterOptions(dimension)
   *
   * The model owns the dataset name and column mappings so a
   * single Cognos dataset powers every visual.
   */
  function DashboardModel(dataEngine) {
    this._engine = dataEngine;
    this._tableName = null; // set after first ingestion
  }

  /**
   * Called by App after ingestion to tell the model which table to query.
   */
  DashboardModel.prototype.setTableName = function (name) {
    this._tableName = name;
  };

  /**
   * Build a WHERE clause from a filters object.
   * filters = { Jaar: [2025, 2026], Project_nummer: ["G100006109"] }
   * → "WHERE Jaar IN (2025, 2026) AND Project_nummer IN ('G100006109')"
   */
  DashboardModel.prototype._where = function (filters) {
    var clauses = [];
    var dims = Object.keys(filters || {});
    for (var i = 0; i < dims.length; i++) {
      var dim = dims[i];
      var vals = filters[dim];
      if (!vals || vals.length === 0) continue;

      // Quote strings, leave numbers as-is
      var quoted = vals.map(function (v) {
        if (typeof v === "number") return String(v);
        return "'" + String(v).replace(/'/g, "''") + "'";
      }).join(", ");

      clauses.push('"' + dim + '" IN (' + quoted + ")");
    }
    return clauses.length > 0 ? "WHERE " + clauses.join(" AND ") : "";
  };

  // ─── PUBLIC QUERY METHODS ──────────────────────────────────────

  /**
   * Aggregated projection: GROUP BY Jaar.
   * Returns: [{ JAAR, RESTBUDGET_OBRENGSTEN, RESTBUDGET__KST_RES,
   *             RESTBUDGET_RESULTAATNEMING, LOPEND_TOTAAL, CUMULATIEVE_BOEKWAARDE }]
   */
  DashboardModel.prototype.getProjectionByYear = async function (filters) {
    var sql = [
      "SELECT",
      "  CAST(Jaar AS INTEGER) AS JAAR,",
      "  SUM(COALESCE(CAST(Restbudget_opbrengsten AS DOUBLE), 0)) AS RESTBUDGET_OBRENGSTEN,",
      "  SUM(COALESCE(CAST(Restbudget_kosten AS DOUBLE), 0)) * -1 AS RESTBUDGET__KST_RES,",
      "  SUM(COALESCE(CAST(Restbudget_resultaatneming AS DOUBLE), 0)) AS RESTBUDGET_RESULTAATNEMING,",
      "  SUM(COALESCE(CAST(Lopend_totaal AS DOUBLE), 0)) AS LOPEND_TOTAAL",
      'FROM "' + this._tableName + '"',
      this._where(filters),
      "GROUP BY Jaar",
      "ORDER BY Jaar"
    ].join("\n");

    var rows = await this._engine.query(sql);

    // Convert types and calculate cumulative
    var cumulative = 0;
    for (var i = 0; i < rows.length; i++) {
      rows[i].JAAR = Number(rows[i].JAAR);
      rows[i].RESTBUDGET_OBRENGSTEN = Number(rows[i].RESTBUDGET_OBRENGSTEN);
      rows[i].RESTBUDGET__KST_RES = Number(rows[i].RESTBUDGET__KST_RES);
      rows[i].RESTBUDGET_RESULTAATNEMING = Number(rows[i].RESTBUDGET_RESULTAATNEMING);
      rows[i].LOPEND_TOTAAL = Number(rows[i].LOPEND_TOTAAL);
      cumulative += rows[i].RESTBUDGET_OBRENGSTEN + rows[i].RESTBUDGET__KST_RES;
      rows[i].CUMULATIEVE_BOEKWAARDE = Math.round(cumulative * 100) / 100;
    }
    return rows;
  };

  /**
   * Aggregated: GROUP BY Project.
   */
  DashboardModel.prototype.getByProject = async function (filters) {
    var sql = [
      "SELECT",
      "  Project_nummer AS project_nummer,",
      "  Project_naam_nummer AS project_naam,",
      "  SUM(COALESCE(CAST(Restbudget_opbrengsten AS DOUBLE), 0)) AS opbrengsten,",
      "  SUM(COALESCE(CAST(Restbudget_kosten AS DOUBLE), 0)) * -1 AS kosten,",
      "  SUM(COALESCE(CAST(Lopend_totaal AS DOUBLE), 0)) AS lopend_totaal",
      'FROM "' + this._tableName + '"',
      this._where(filters),
      "GROUP BY Project_nummer, Project_naam_nummer",
      "ORDER BY opbrengsten DESC"
    ].join("\n");

    return await this._engine.query(sql);
  };

  /**
   * KPI summary: single-row totals.
   * Returns: [{ total_opbrengsten, total_kosten, netto_resultaat, project_count, year_min, year_max }]
   */
  DashboardModel.prototype.getKPIs = async function (filters) {
    var sql = [
      "SELECT",
      "  SUM(COALESCE(CAST(Restbudget_opbrengsten AS DOUBLE), 0)) AS total_opbrengsten,",
      "  SUM(COALESCE(CAST(Restbudget_kosten AS DOUBLE), 0)) * -1 AS total_kosten,",
      "  SUM(COALESCE(CAST(Lopend_totaal AS DOUBLE), 0)) AS netto_resultaat,",
      "  COUNT(DISTINCT Project_nummer) AS project_count,",
      "  MIN(Jaar) AS year_min,",
      "  MAX(Jaar) AS year_max",
      'FROM "' + this._tableName + '"',
      this._where(filters)
    ].join("\n");

    return await this._engine.query(sql);
  };

  /**
   * Detail rows: raw table data with all columns.
   * Supports limit/offset for pagination.
   */
  DashboardModel.prototype.getDetailTable = async function (filters, limit, offset) {
    var sql = [
      "SELECT",
      "  Project_nummer,",
      "  Project_naam_nummer,",
      "  Jaar,",
      "  Datum_event,",
      "  Gebeurtenis_code,",
      "  Restbudget_opbrengsten,",
      "  Restbudget_kosten,",
      "  Restbudget_resultaatneming,",
      "  Lopend_totaal",
      'FROM "' + this._tableName + '"',
      this._where(filters),
      "ORDER BY Jaar DESC, Project_nummer"
    ].join("\n");

    if (limit != null) {
      sql += " LIMIT " + limit;
    }
    if (offset != null) {
      sql += " OFFSET " + offset;
    }

    return await this._engine.query(sql);
  };

  /**
   * Get distinct values for a filter dropdown.
   * @param {string} column - cleaned column name (e.g. "Jaar", "Project_nummer")
   */
  DashboardModel.prototype.getFilterOptions = async function (column) {
    var sql = [
      'SELECT DISTINCT "' + column + '" AS value',
      'FROM "' + this._tableName + '"',
      'ORDER BY "' + column + '"'
    ].join("\n");

    var rows = await this._engine.query(sql);
    return rows.map(function (r) { return r.value; });
  };

  return DashboardModel;
});

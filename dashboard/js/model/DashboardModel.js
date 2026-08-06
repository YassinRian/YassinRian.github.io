define([], function () {
  "use strict";

  /**
   * DashboardModel — Multi-table semantic query layer on DuckDB.
   *
   * Register tables with column mappings so the same query methods
   * work across different star schemas.
   *
   *   model.registerTable("proj_year", {
   *       primary: true,
   *       columns: { year: "Jaar", revenue: "Restbudget_opbrengsten", ... }
   *   });
   *   model.registerTable("proj_mijlpaal", {
   *       columns: { year: "Jaar", quarter: "Kwartaal", ... }
   *   });
   *
   *   model.getProjectionByYear(filters);           // uses primary table
   *   model.getProjectionByYear(filters, "other");   // explicit table
   *   model.query("SELECT * FROM proj_mijlpaal");   // raw SQL
   */

  function DashboardModel(dataEngine) {
    this._engine = dataEngine;
    this._tables = {};
    this._primary = null;
  }

  // ═══════════════════════════════════════════════════════════
  // TABLE REGISTRATION
  // ═══════════════════════════════════════════════════════════

  /**
   * Register a DuckDB table with its column mapping.
   *
   * @param {string} name    — table name in DuckDB
   * @param {object} config  — { primary?: bool, columns: { logical: "physical" } }
   */
  DashboardModel.prototype.registerTable = function (name, config) {
    this._tables[name] = {
      name: name,
      columns: config.columns || {},
      config: config
    };
    if (config.primary) this._primary = name;
    console.log("[DashboardModel] Registered table:", name,
      config.primary ? "(primary)" : "");
  };

  /**
   * Get the primary table name.
   */
  DashboardModel.prototype.primaryTable = function () {
    return this._primary;
  };

  /**
   * List all registered table names.
   */
  DashboardModel.prototype.tableNames = function () {
    return Object.keys(this._tables);
  };

  /**
   * Get column mapping for a table (or primary).
   */
  DashboardModel.prototype._cols = function (tableName) {
    var t = this._tables[tableName || this._primary];
    if (!t) throw new Error("Table not registered: " + (tableName || this._primary));
    return t.columns;
  };

  /**
   * Resolve table name — returns primary if none given.
   */
  DashboardModel.prototype._table = function (tableName) {
    return tableName || this._primary;
  };

  /**
   * Quote a table name safely.
   */
  DashboardModel.prototype._quote = function (name) {
    return '"' + name.replace(/"/g, '""') + '"';
  };

  // ═══════════════════════════════════════════════════════════
  // WHERE CLAUSE BUILDER — shared across all tables
  // ═══════════════════════════════════════════════════════════

  DashboardModel.prototype._where = function (filters) {
    var clauses = [];
    var dims = Object.keys(filters || {});
    for (var i = 0; i < dims.length; i++) {
      var dim = dims[i];
      var vals = filters[dim];
      if (!vals || vals.length === 0) continue;

      var quoted = vals.map(function (v) {
        if (typeof v === "number") return String(v);
        return "'" + String(v).replace(/'/g, "''") + "'";
      }).join(", ");

      clauses.push('"' + dim + '" IN (' + quoted + ")");
    }
    return clauses.length > 0 ? "WHERE " + clauses.join(" AND ") : "";
  };

  // ═══════════════════════════════════════════════════════════
  // QUERY METHODS — primary table by default, override with 2nd arg
  // ═══════════════════════════════════════════════════════════

  /**
   * Aggregated projection: GROUP BY year.
   */
  DashboardModel.prototype.getProjectionByYear = async function (filters, tableName) {
    var t = this._table(tableName);
    var c = this._cols(t);

    var sql = [
      "SELECT",
      "  CAST(" + c.year + " AS INTEGER) AS JAAR,",
      "  SUM(COALESCE(CAST(" + c.revenue + " AS DOUBLE), 0)) AS RESTBUDGET_OBRENGSTEN,",
      "  SUM(COALESCE(CAST(" + c.cost + " AS DOUBLE), 0)) * -1 AS RESTBUDGET__KST_RES,",
      "  SUM(COALESCE(CAST(" + c.resultaatneming + " AS DOUBLE), 0)) AS RESTBUDGET_RESULTAATNEMING,",
      "  SUM(COALESCE(CAST(" + c.runningTotal + " AS DOUBLE), 0)) AS LOPEND_TOTAAL",
      "FROM " + this._quote(t),
      this._where(filters),
      "GROUP BY " + c.year,
      "ORDER BY " + c.year
    ].join("\n");

    var rows = await this._engine.query(sql);

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
   * Aggregated: GROUP BY project.
   */
  DashboardModel.prototype.getByProject = async function (filters, tableName) {
    var t = this._table(tableName);
    var c = this._cols(t);

    var sql = [
      "SELECT",
      "  " + c.projectCode + " AS project_nummer,",
      "  " + c.projectName + " AS project_naam,",
      "  SUM(COALESCE(CAST(" + c.revenue + " AS DOUBLE), 0)) AS opbrengsten,",
      "  SUM(COALESCE(CAST(" + c.cost + " AS DOUBLE), 0)) * -1 AS kosten,",
      "  SUM(COALESCE(CAST(" + c.runningTotal + " AS DOUBLE), 0)) AS lopend_totaal",
      "FROM " + this._quote(t),
      this._where(filters),
      "GROUP BY " + c.projectCode + ", " + c.projectName,
      "ORDER BY opbrengsten DESC"
    ].join("\n");

    return await this._engine.query(sql);
  };

  /**
   * KPI summary: single-row totals.
   */
  DashboardModel.prototype.getKPIs = async function (filters, tableName) {
    var t = this._table(tableName);
    var c = this._cols(t);

    var sql = [
      "SELECT",
      "  SUM(COALESCE(CAST(" + c.revenue + " AS DOUBLE), 0)) AS total_opbrengsten,",
      "  SUM(COALESCE(CAST(" + c.cost + " AS DOUBLE), 0)) * -1 AS total_kosten,",
      "  SUM(COALESCE(CAST(" + c.runningTotal + " AS DOUBLE), 0)) AS netto_resultaat,",
      "  COUNT(DISTINCT " + c.projectCode + ") AS project_count,",
      "  MIN(" + c.year + ") AS year_min,",
      "  MAX(" + c.year + ") AS year_max",
      "FROM " + this._quote(t),
      this._where(filters)
    ].join("\n");

    return await this._engine.query(sql);
  };

  /**
   * Detail rows with all columns from the primary table.
   */
  DashboardModel.prototype.getDetailTable = async function (filters, limit, offset, tableName) {
    var t = this._table(tableName);
    var c = this._cols(t);

    var sql = [
      "SELECT",
      "  " + c.projectCode + " AS Project_nummer,",
      "  " + c.projectName + " AS Project_naam_nummer,",
      "  " + c.year + " AS Jaar,",
      "  " + (c.eventDate || c.year) + " AS Datum_event,",
      "  " + (c.eventCode || c.year) + " AS Gebeurtenis_code,",
      "  " + c.revenue + " AS Restbudget_opbrengsten,",
      "  " + c.cost + " AS Restbudget_kosten,",
      "  " + c.resultaatneming + " AS Restbudget_resultaatneming,",
      "  " + c.runningTotal + " AS Lopend_totaal",
      "FROM " + this._quote(t),
      this._where(filters),
      "ORDER BY " + c.year + " DESC, " + c.projectCode
    ].join("\n");

    if (limit != null) sql += " LIMIT " + limit;
    if (offset != null) sql += " OFFSET " + offset;

    return await this._engine.query(sql);
  };

  /**
   * Get distinct values for a dimension (filter dropdown).
   * @param {string} column — physical column name
   * @param {string} tableName
   */
  DashboardModel.prototype.getFilterOptions = async function (column, tableName) {
    var t = this._table(tableName);
    var sql = [
      "SELECT DISTINCT " + this._quote(column) + " AS value",
      "FROM " + this._quote(t),
      "ORDER BY " + this._quote(column)
    ].join("\n");

    var rows = await this._engine.query(sql);
    return rows.map(function (r) { return r.value; });
  };

  /**
   * Raw SQL query — for ad-hoc use and secondary tables.
   */
  DashboardModel.prototype.query = async function (sql) {
    return await this._engine.query(sql);
  };

  /**
   * Generic aggregate: GROUP BY any dimension, SUM any measure.
   * Useful for secondary star schemas without dedicated methods.
   *
   * @param {string} dimension  — column to group by
   * @param {string} measure    — column to sum
   * @param {string} tableName
   * @param {object} filters
   * @returns {Array<{label, value}>}
   */
  DashboardModel.prototype.aggregate = async function (dimension, measure, filters, tableName) {
    var t = this._table(tableName);
    var sql = [
      "SELECT",
      "  " + this._quote(dimension) + " AS label,",
      "  SUM(COALESCE(CAST(" + this._quote(measure) + " AS DOUBLE), 0)) AS value",
      "FROM " + this._quote(t),
      this._where(filters),
      "GROUP BY " + this._quote(dimension),
      "ORDER BY value DESC"
    ].join("\n");

    return await this._engine.query(sql);
  };

  return DashboardModel;
});

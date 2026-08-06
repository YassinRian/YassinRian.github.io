define([], function () {
  "use strict";

  return {
    chartDefaults: {
      height: "350px",
      responsive: true,
      theme: "default",
    },

    tableDefaults: {
      height: "400px",
      pagination: true,
      pageSize: 50,
      movableColumns: true,
      resizableColumns: true,
    },

    dashboardLayout: {
      columns: 12,
      chartSpan: 6,
      tableSpan: 12,
      filterSpan: 12,
      gap: "16px",
    },

    drillMaxDepth: 4,

    kpiThresholds: {
      good: 90,
      warning: 70,
      critical: 0,
    },

    colors: {
      good: "#52c41a",
      warning: "#faad14",
      critical: "#ff4d4f",
      primary: "#1890ff",
      series: [
        "#1890ff",
        "#52c41a",
        "#faad14",
        "#ff4d4f",
        "#722ed1",
        "#13c2c2",
        "#eb2f96",
        "#fa8c16",
      ],
    },

    mockDataSize: 500,

    // Cognos Integration Settings
    primaryTable: null, // null = use first available table

    // Expected datasets from Cognos Data Module
    // Set to 0 to auto-detect (render after first draw())
    expectedDatasets: 0,

    // Component-to-dataset mapping (for multi-dataset dashboards)
    // Each component specifies which table to query
    componentDataSources: {
      // Example:
      // "sales-chart": { table: "sales", dimension: "region", measure: "revenue" },
      // "inventory-table": { table: "inventory" },
    },
  };
});

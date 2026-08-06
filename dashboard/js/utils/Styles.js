define([], function () {
  "use strict";

  const css = `
    .dashboard-wrapper {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px;
      background: #f5f5f5;
      color: #333;
      min-height: 100vh;
      box-sizing: border-box;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid #1890ff;
    }

    .dashboard-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .dashboard-status {
      font-size: 13px;
      color: #666;
      font-style: italic;
    }

    .btn-reset-filters {
      padding: 8px 16px;
      background: #ff4d4f;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: background 0.2s;
    }

    .btn-reset-filters:hover {
      background: #cf1322;
    }

    .dashboard-breadcrumb {
      margin-bottom: 16px;
      min-height: 24px;
    }

    .breadcrumb-trail {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #666;
    }

    .breadcrumb-home {
      color: #1890ff;
      cursor: pointer;
    }

    .breadcrumb-item {
      color: #333;
    }

    .breadcrumb-sep {
      color: #999;
    }

    .dashboard-filters {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 20px;
      padding: 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 180px;
    }

    .filter-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      color: #666;
      letter-spacing: 0.5px;
    }

    .filter-select {
      padding: 8px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      font-size: 13px;
      background: white;
      cursor: pointer;
      transition: border-color 0.2s;
    }

    .filter-select:hover {
      border-color: #1890ff;
    }

    .filter-select:focus {
      outline: none;
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24,144,255,0.2);
    }

    .dashboard-charts {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }

    .chart-panel {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .chart-panel-header {
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .chart-panel-body {
      padding: 16px;
    }

    .dashboard-table {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .table-header {
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
      font-weight: 600;
      color: #1a1a1a;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .table-count {
      font-size: 12px;
      color: #666;
      font-weight: normal;
    }

    .dashboard-loading {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255,255,255,0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      z-index: 1000;
    }

    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #f0f0f0;
      border-top-color: #1890ff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .status-on-target {
      color: #52c41a;
      font-weight: 600;
    }

    .status-below-target {
      color: #faad14;
      font-weight: 600;
    }

    .status-at-risk {
      color: #ff4d4f;
      font-weight: 600;
    }

    .kpi-good {
      background: #f6ffed;
      border-left: 3px solid #52c41a;
    }

    .kpi-warning {
      background: #fffbe6;
      border-left: 3px solid #faad14;
    }

    .kpi-critical {
      background: #fff2f0;
      border-left: 3px solid #ff4d4f;
    }

    @media (max-width: 768px) {
      .dashboard-charts {
        grid-template-columns: 1fr;
      }
      
      .dashboard-filters {
        flex-direction: column;
      }
      
      .filter-group {
        width: 100%;
      }
    }
  `;

  return {
    inject: function () {
      const id = "cognos-dashboard-styles";
      if (!document.getElementById(id)) {
        const style = document.createElement("style");
        style.id = id;
        style.innerHTML = css;
        document.head.appendChild(style);
      }
    },
  };
});

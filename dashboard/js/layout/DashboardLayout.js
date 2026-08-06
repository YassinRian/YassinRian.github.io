define([], function () {
  "use strict";

  class DashboardLayout {
    constructor(container) {
      this.container = container;
      this.filterContainer = null;
      this.chartContainer = null;
      this.tableContainer = null;
      this.breadcrumbContainer = null;
    }

    render() {
      this.container.innerHTML = `
        <div class="dashboard-wrapper">
          <div class="dashboard-header">
            <h1 class="dashboard-title">Project 364 - Financiele Prognose</h1>
            <div class="dashboard-actions">
              <span class="dashboard-status" id="status-text"></span>
            </div>
          </div>
          
          <div class="dashboard-breadcrumb" id="breadcrumb"></div>
          
          <div class="dashboard-charts" id="chart-area" style="grid-template-columns: 1fr;"></div>
          
          <div class="dashboard-table" id="table-area"></div>
        </div>
      `;

      this.chartContainer = this.container.querySelector("#chart-area");
      this.tableContainer = this.container.querySelector("#table-area");
      this.breadcrumbContainer = this.container.querySelector("#breadcrumb");
    }

    updateBreadcrumb(drillPath) {
      if (!drillPath || drillPath.length === 0) {
        this.breadcrumbContainer.innerHTML = "";
        return;
      }

      const crumbs = drillPath.map(
        (item, index) =>
          `<span class="breadcrumb-item" data-level="${index}">
            ${item.dimension}: <strong>${item.value}</strong>
          </span>`,
      );

      this.breadcrumbContainer.innerHTML = `
        <div class="breadcrumb-trail">
          <span class="breadcrumb-home">All Data</span>
          ${crumbs.map((c) => `<span class="breadcrumb-sep">&rsaquo;</span>${c}`).join("")}
        </div>
      `;
    }

    showLoading(message = "Loading...") {
      const overlay = document.createElement("div");
      overlay.className = "dashboard-loading";
      overlay.innerHTML = `<div class="loading-spinner"></div><span>${message}</span>`;
      this.container.appendChild(overlay);
    }

    hideLoading() {
      const overlay = this.container.querySelector(".dashboard-loading");
      if (overlay) overlay.remove();
    }
  }

  return DashboardLayout;
});

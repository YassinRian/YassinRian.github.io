define([], function () {
  "use strict";

  class StateStore {
    constructor(eventBus) {
      this.eventBus = eventBus;
      this.filters = {};
      this.drillPath = [];
      this.selectedRows = [];
    }

    getFilters() {
      return { ...this.filters };
    }

    updateFilter(dimension, values) {
      if (values && values.length > 0) {
        this.filters[dimension] = values;
      } else {
        delete this.filters[dimension];
      }
      this.eventBus.emit("state:updated", {
        filters: this.getFilters(),
        drillPath: this.getDrillPath(),
      });
    }

    clearFilter(dimension) {
      delete this.filters[dimension];
      this.eventBus.emit("state:updated", {
        filters: this.getFilters(),
        drillPath: this.getDrillPath(),
      });
    }

    clearAllFilters() {
      this.filters = {};
      this.drillPath = [];
      this.eventBus.emit("state:updated", {
        filters: {},
        drillPath: [],
      });
    }

    drillDown(dimension, value) {
      this.drillPath.push({ dimension, value });
      this.filters[dimension] = [value];
      this.eventBus.emit("state:updated", {
        filters: this.getFilters(),
        drillPath: this.getDrillPath(),
      });
    }

    drillUp() {
      if (this.drillPath.length === 0) return;
      const removed = this.drillPath.pop();
      delete this.filters[removed.dimension];
      this.eventBus.emit("state:updated", {
        filters: this.getFilters(),
        drillPath: this.getDrillPath(),
      });
    }

    getDrillPath() {
      return [...this.drillPath];
    }

    getDrillLevel() {
      return this.drillPath.length;
    }

    setSelectedRows(rows) {
      this.selectedRows = rows;
      this.eventBus.emit("selection:changed", { rows });
    }
  }

  return StateStore;
});

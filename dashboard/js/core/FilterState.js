define([], function () {
  "use strict";

  /**
   * FilterState — Central cross-filter model.
   *
   * Holds the current filter selections for all dimensions.
   * Any component can read filters or subscribe to changes.
   *
   *   state.set("Jaar", [2025, 2026])   // set filter
   *   state.clear("Jaar")               // clear one dimension
   *   state.clearAll()                  // reset everything
   *   state.get()                       // → { Jaar: [2025, 2026] }
   */
  function FilterState(eventBus) {
    this._bus = eventBus;
    this._filters = {};
  }

  /**
   * Set filter values for a dimension.
   * Pass an empty array or null to clear that dimension.
   */
  FilterState.prototype.set = function (dimension, values) {
    if (!values || values.length === 0) {
      delete this._filters[dimension];
    } else {
      this._filters[dimension] = values.slice();
    }
    this._emit();
  };

  /**
   * Toggle a single value on/off within a dimension.
   */
  FilterState.prototype.toggle = function (dimension, value) {
    var current = this._filters[dimension] || [];
    var idx = current.indexOf(value);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(value);
    }
    this.set(dimension, current);
  };

  /**
   * Clear one dimension entirely.
   */
  FilterState.prototype.clear = function (dimension) {
    delete this._filters[dimension];
    this._emit();
  };

  /**
   * Clear all filters.
   */
  FilterState.prototype.clearAll = function () {
    this._filters = {};
    this._emit();
  };

  /**
   * Get a snapshot of current filters.
   */
  FilterState.prototype.get = function () {
    var out = {};
    var keys = Object.keys(this._filters);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      out[k] = this._filters[k].slice();
    }
    return out;
  };

  /**
   * Check if any filters are active.
   */
  FilterState.prototype.hasAny = function () {
    return Object.keys(this._filters).length > 0;
  };

  /**
   * Check if a specific dimension is filtered.
   */
  FilterState.prototype.has = function (dimension) {
    var vals = this._filters[dimension];
    return vals && vals.length > 0;
  };

  FilterState.prototype._emit = function () {
    this._bus.emit("filters:changed", this.get());
  };

  return FilterState;
});

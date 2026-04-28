define([], function() {
    "use strict";
    const listeners = new Set();
    
    const state = {
        status: "Wachten op data...",
        results: [],
        filters: { year: null }
    };

    return {
        // Subscribe to state changes
        subscribe: (fn) => {
            listeners.add(fn);
            return () => listeners.delete(fn); // Returns an unsubscribe function
        },

        // Update any part of the state
        setState: (updates) => {
            Object.assign(state, updates);
            listeners.forEach(fn => fn(state));
        },

        get state() { return state; }
    };
});
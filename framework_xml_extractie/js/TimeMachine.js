define([], function() {

    "use strict";

    class TimeMachine {
    constructor() {
        this.startDate = null;
        this.endDate = null;
        this.isActive = false;
    }

    setRange(daysAgo) {
        this.endDate = new Date();
        this.startDate = new Date();
        this.startDate.setDate(this.endDate.getDate() - daysAgo);
        this.isActive = true;
    }

    reset() {
        this.isActive = false;
        this.startDate = null;
        this.endDate = null;
    }

    // Controleert of een item (tabel of kolom) binnen het bereik valt
    isModified(date) {
        if (!this.isActive || !date) return false;
        return date >= this.startDate && date <= this.endDate;
    }

    // Filtert de hele dataset op basis van tijd
    filterData(allData) {
        if (!this.isActive) return allData;

        return allData.filter(table => {
            // Een tabel "matcht" als de tabel zelf IS gewijzigd...
            const tableMatch = this.isModified(table.lastModified);
            // ...OF als een van de kolommen IS gewijzigd
            const columnMatch = table.columns.some(col => this.isModified(col.lastModified));
            
            return tableMatch || columnMatch;
        });
    }
}

return TimeMachine;

});
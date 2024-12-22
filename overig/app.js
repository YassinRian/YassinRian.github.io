define([], function() {
    
    class App {
        constructor() {
            console.log(this.oDataStore)
        }

        setData(oDataStore) {
            this.oDataStore = oDataStore;
        }
    }
    
    return App; 
});
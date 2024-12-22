define([], function() {
    
    class App {
        constructor() {
            console.log(this.dataStore)
        }

        draw(oControlHost) {
            console.log(oControlHost)
        }

        setData(oDataStore) {
            this.dataStore = oDataStore;
        }
    }
    
    return App; 
});
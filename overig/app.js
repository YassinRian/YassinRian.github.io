define([], function() {
    
    class App {
        constructor() {
            console.log(this.oDataStore)
        }

        draw() {
            console.log('draw app')
        }

        setData(oDataStore) {
            this.oDataStore = oDataStore;
        }
    }
    
    return App; 
});
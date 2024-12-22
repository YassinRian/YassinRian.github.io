define([], function() {
    
    class App {
        constructor() {
            this.dataStore = null;
        }

        draw(oControlHost) {
            console.log(this.dataStore)
        }

        setData(oDataStore) {
            this.dataStore = oDataStore.control.getDataStore("cluster_ds");
            //this.dataStore = oDataStore;
        }
    }
    
    return App; 
});
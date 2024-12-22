// testen van meerdere datasets
define([], function() {
    
    class App {
        constructor() {
            this.dataStore = null;
        }

        draw(oControlHost) {
            console.log(this.dataStore)
        }

        setData(oDataStore) {
            this.dataStore = oDataStore.control.getDataStore("cluster_ds"); // gets the dataset of cluster_ds
            //this.dataStore = oDataStore;
        }
    }
    
    return App; 
});
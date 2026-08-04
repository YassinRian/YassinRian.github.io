// ExtractionTest.js - Absolute minimum Cognos custom control
console.log("=== ExtractionTest.js FILE LOADED ===");

define([], function () {
  console.log("=== ExtractionTest DEFINE CALLBACK ===");

  class ExtractionTest {
    constructor() {
      console.log("=== ExtractionTest CONSTRUCTOR ===");
    }

    setData(oControlHost, dataStore, name) {
      console.log("=== setData() CALLED ===");
      console.log("oControlHost:", oControlHost);
      console.log("dataStore:", dataStore);
      console.log("name:", name);

      if (dataStore) {
        console.log("dataStore type:", typeof dataStore);
        console.log("dataStore keys:", Object.keys(dataStore));

        if (dataStore.columnHeaders) {
          console.log("columnHeaders:", dataStore.columnHeaders);
        }
        if (dataStore.rowData) {
          console.log("rowData length:", dataStore.rowData.length);
          console.log("first row:", dataStore.rowData[0]);
        }
      }
    }

    draw(oControlHost) {
      console.log("=== draw() CALLED ===");
      oControlHost.container.innerHTML = "<h1>Extraction Test Working</h1>";
    }
  }

  return ExtractionTest;
});

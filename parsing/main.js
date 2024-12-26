define([
  "jquery",
  "https://yassinrian.github.io/parsing/xmlParser.js",
  "https://yassinrian.github.io/parsing/tableRenderer.js",
  "https://yassinrian.github.io/parsing/tableStyles.js",
  "https://yassinrian.github.io/parsing/buttonMarkup.js",
  "https://yassinrian.github.io/parsing/sortedXml.js",
  "https://yassinrian.github.io/parsing/modalManager.js",
], function ($, xmlParser, tableRenderer, _, buttons, sortedXml, moduleModalManager) {
 
  class App {
    constructor() {
      this.modal = null;
      this.cache = new CacheManager();
      this.oControlHost = null;
    }

    draw(oControlHost) {
      const { userName } = oControlHost.configuration || "";
      if (userName === "951100") {
        this.oControlHost = oControlHost;
        const elm = oControlHost.container;
        
        this.initializeUI(elm);
        this.initializeEventHandlers();
      }
    }

    initializeUI(container) {
      // Initialize Modal Manager
      this.modal = new moduleModalManager.ModalManager({
        draggable: true,
        resizable: true,
        tableRenderer: tableRenderer
      });

      // Add UI elements
      $(container).append(buttons.selectBox()); // markup for the buttons and select box
      
      // Initialize XML export functionality
      sortedXml.initExportButton(this.oControlHost);
    }

    initializeEventHandlers() {
      $("#button_parse").on("click", () => {
        const selectedType = $("#select_parse_type").val();
        const xmlData = this.oControlHost.page.application.document.GetReportXml();
  
        try {
          const parsedData = this.cache.getOrParse(
            selectedType, 
            xmlData, 
            this.parseData.bind(this)
          );
          
          // Just call renderTable with the parsed data and type
          this.modal.renderTable(parsedData, selectedType);
        } catch (error) {
          console.error('Error parsing data:', error);
        }
      });
    }


    parseData(type, xmlString) {
      switch (type) {
        case "Queries":
          return xmlParser.getQueries(xmlString);
        case "Lists":
          const queryData = xmlParser.getQueries(xmlString);
          const listData = xmlParser.getLists(xmlString);
          return xmlParser.addLabelsToList(queryData, listData);
        case "Filters":
          return xmlParser.getDetailFilters(xmlString);
        default:
          throw new Error("Unknown type selected");
      }
    }
  }

  // Cache Manager Class
  class CacheManager {
    constructor() {
      this.currentId = null;
    }

    generateCacheKey(type, id) {
      return `cache_${type}_${id || 'new'}`;
    }

    getOrParse(type, xmlString, parseFunction) {
      const uniqueId = this.currentId || Math.random().toString(36).substr(2, 9);
      const cacheKey = this.generateCacheKey(type, uniqueId);

      this.clearIrrelevantCaches(type, uniqueId);

      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        console.log(`Using cached data for ${type} with ID ${uniqueId}`);
        return JSON.parse(cachedData);
      }

      console.log(`Parsing and caching data for ${type}`);
      const parsedData = parseFunction(type, xmlString);
      
      this.currentId = uniqueId;
      localStorage.setItem(cacheKey, JSON.stringify(parsedData));
      return parsedData;
    }

    clearIrrelevantCaches(type, currentId) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`cache_${type}_`) && !key.endsWith(`_${currentId}`)) {
          localStorage.removeItem(key);
          console.log(`Cleared irrelevant cache: ${key}`);
        }
      });
    }
  }

  return App;
});
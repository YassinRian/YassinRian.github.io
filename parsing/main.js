define([
  "jquery",
  "https://yassinrian.netlify.app/parsing/xmlParser.js",
  "https://yassinrian.netlify.app/parsing/tableRenderer.js",
  "https://yassinrian.netlify.app/parsing/csvUtitlity.js",
  "https://yassinrian.netlify.app/parsing/tableStyles.js",
  "https://yassinrian.netlify.app/parsing/buttonMarkup.js",
  "https://yassinrian.netlify.app/parsing/sortedXml.js",
  "https://yassinrian.netlify.app/parsing/modalManager.js",
], function ($, xmlParser, tableRenderer, csvUtitlity, _, buttons, sortedXml, moduleModalManager) {
 
  class App {
    constructor() {
      this.modal = null;
      this.cache = new CacheManager();
      this.oControlHost = null;
    }

    draw(oControlHost) {
      const { userName } = oControlHost.configuration || "";

      //const jsonCap = JSON.parse(window[0]._hle);
      //const capability = jsonCap.cmProperties.metadataModelPackage[0].effectiveUserCapabilities.includes('canUseReportStudio') || "";
      console.log(oControlHost)
      if (userName) {
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
        tableRenderer,
        csvUtitlity
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
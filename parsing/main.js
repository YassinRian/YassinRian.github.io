define([
  "jquery",
  "https://yassinrian.github.io/parsing/xmlParser.js",
  "https://yassinrian.github.io/parsing/tableRenderer.js",
  "https://yassinrian.github.io/parsing/tableStyles.js",
  "https://yassinrian.github.io/parsing/modalMarkup.js",
], function ($, xmlParser, tableRenderer, tableStyles, modalMarkup) {
  function App() {}

  App.prototype.initialize = function (oPage, fnDoneInitializing) {
    this.xml_data = oPage.page.application.document.reportXML;
    fnDoneInitializing();
  };

  App.prototype.draw = function (oControlHost) {
    const cacheKeyPrefix = "cached_";
    const { userName } = oControlHost.configuration || ""; // Add fallback empty string
    if (userName === "951100") {
      const elm = oControlHost.container;
      $(elm).append(modalMarkup.selectBox());
      $("body").append(modalMarkup.modal());

      $("#button_parse").on("click", () => {
        const selectedType = $("#select_parse_type").val();
        const xmlData = this.xml_data;

        let parsedData;

        switch (selectedType) {
          case "Queries":
            const queriesData = parseAndCache(
              "Queries",
              xmlData,
              xmlParser.getQueries
            );
            tableRenderer.renderTable(
              queriesData,
              "#table_container",
              "Queries"
            );
            break;
          case "Lists":
            const listsData = parseAndCache("Lists", xmlData, (xmlString) => {
              const queryData = xmlParser.getQueries(xmlString);
              const listData = xmlParser.getLists(xmlString);
              return xmlParser.addLabelsToList(queryData, listData);
            });
            tableRenderer.renderTable(listsData, "#table_container", "Lists");
            break;
          case "Detail Filters":
            const detailFiltersData = parseAndCache(
              "DetailFilters",
              xmlData,
              xmlParser.getDetailFilters
            );
            tableRenderer.renderTable(
              detailFiltersData,
              "#table_container",
              "Detail Filters"
            );
            break;
          default:
            console.error("Unknown type selected");
            return;
        }

        tableRenderer.renderTable(parsedData, "#table_container", selectedType);
        $("#table_modal").fadeIn(150);
      });

      // Function to clear cache
      function clearCache() {
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith(cacheKeyPrefix)) {
            sessionStorage.removeItem(key);
          }
        });
        console.log("Cache cleared due to tab/window switch");
      }

      // Example: Function to parse and cache
      function parseAndCache(type, xmlString, parserFunction) {
        const cacheKey = `${cacheKeyPrefix}${type}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
          console.log(`Using cached data for ${type}`);
          return JSON.parse(cachedData);
        }

        console.log(`Parsing and caching data for ${type}`);
        const parsedData = parserFunction(xmlString);
        sessionStorage.setItem(cacheKey, JSON.stringify(parsedData));
        return parsedData;
      }

      // Listen for visibility change event
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          // Page is no longer visible (switched to another tab/window)
          clearCache();
        }
      });

      // minimize and drag modal

      const $modal = $("#table_modal");
      const $modalContent = $modal.find(".modal-content");
      const $closeModal = $modal.find(".close-modal");

      let isDragging = false;
      let offsetX = 0;
      let offsetY = 0;

      // Close Modal
      $closeModal.on("click", function () {
        $modal.hide();
        $("body").removeClass("modal-active");
      });

      // Close modal when clicking outside
      $(window).on("click", function (event) {
        if ($(event.target).is("#table_modal")) {
          $("#table_modal").fadeOut(150);
        }
      });

      // Make Modal Draggable
      $modalContent.on("mousedown", function (e) {
        isDragging = true;
        offsetX = e.clientX - $modalContent.offset().left;
        offsetY = e.clientY - $modalContent.offset().top;
        $modalContent.css("cursor", "grabbing");
      });

      $(document).on("mousemove", function (e) {
        if (isDragging) {
          $modalContent.css({
            left: `${e.clientX - offsetX}px`,
            top: `${e.clientY - offsetY}px`,
          });
        }
      });

      $(document).on("mouseup", function () {
        if (isDragging) {
          isDragging = false;
          $modalContent.css("cursor", "move");
        }
      });
    } // End if statement
  };
  return App;
});

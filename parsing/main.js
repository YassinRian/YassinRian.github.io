define([
  "jquery",
  "https://yassinrian.github.io/parsing/xmlParser.js",
  "https://yassinrian.github.io/parsing/tableRenderer.js",
  "https://yassinrian.github.io/parsing/tableStyles.js",
  "https://yassinrian.github.io/parsing/modalMarkup.js",
], function ($, xmlParser, tableRenderer, tableStyles, modalMarkup) {
  function App() {}

  //=======================================================================================================
  App.prototype.initialize = function (oPage, fnDoneInitializing) {
    this.xml_data = oPage.page.application.document.reportXML;
    fnDoneInitializing();
  };

  App.prototype.draw = function (oControlHost) {
    const { userName } = oControlHost.configuration || ""; // Add fallback empty string
    if (userName === "951100") {
      const elm = oControlHost.container;
      $(elm).append(modalMarkup.selectBox());
      $("body").append(modalMarkup.modal());

      $("#button_parse").on("click", function () {
        const button = this;
        const selectedType = $("#select_parse_type").val(); // Get selected type
        const xmlData = this.xml_data;

        // Ensure button has `data-type` and check for `data-id`
        $(button).attr("data-type", selectedType);
        let uniqueId = $(button).data("id");

        if (!uniqueId) {
          uniqueId = Math.random().toString(36).substr(2, 9);
          $(button).attr("data-id", uniqueId);
        }

        const cacheKey = `cache_${selectedType}_${uniqueId}`;
        let parsedData = getCache(cacheKey);

        if (!parsedData) {
          console.log(`No cache found for ${cacheKey}, parsing new data`);
          switch (selectedType) {
            case "Queries":
              parsedData = parseAndCache(
                "Queries",
                xmlData,
                xmlParser.getQueries
              );
              break;
            case "Lists":
              parsedData = parseAndCache("Lists", xmlData, (xmlString) => {
                const queryData = xmlParser.getQueries(xmlString);
                const listData = xmlParser.getLists(xmlString);
                return xmlParser.addLabelsToList(queryData, listData);
              });
              break;
            case "Detail Filters":
              parsedData = parseAndCache(
                "DetailFilters",
                xmlData,
                xmlParser.getDetailFilters
              );
              break;
            default:
              console.error("Unknown type selected");
              return;
          }
          setCache(cacheKey, parsedData);
        } else {
          console.log(`Using cached data for ${cacheKey}`);
        }

        // Render the table
        tableRenderer.renderTable(parsedData, "#table_container", selectedType);
        $("#table_modal").fadeIn(150);
      });

      function setCache(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
        console.log(`Cached data for ${key}`);
      }

      function getCache(key) {
        const data = localStorage.getItem(key);
        if (data) {
          console.log(`Retrieved cached data for ${key}`);
          return JSON.parse(data);
        }
        console.log(`No cached data for ${key}`);
        return null;
      }

      function clearCache(key) {
        localStorage.removeItem(key);
        console.log(`Cleared cache for ${key}`);
      }

      function parseAndCache(type, xmlString, parserFunction) {
        const cacheKey = `cache_${type}`;
        const cachedData = getCache(cacheKey);

        // If cached data exists, return it
        if (cachedData) {
          console.log(`Using cached data for ${type}`);
          return cachedData;
        }

        console.log(`Parsing and caching new data for ${type}`);

        // Parse the data
        const parsedData = parserFunction(xmlString);

        // Clear any old cache entries for this type
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith(`cache_${type}`)) {
            clearCache(key);
          }
        });

        // Store the new cache
        setCache(cacheKey, parsedData);

        return parsedData;
      }

      // cache functions=======================================

      function parseAndCache(button, xmlString, parserFunction) {
        // Get attributes from the button
        const type = $(button).data("type");
        let uniqueId = $(button).data("id"); // Retrieve existing ID if available
        const cacheKey = `cache_${type}_${uniqueId || "new"}`;

        // Check if data exists in cache
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData && type && uniqueId) {
          console.log(`Using cached data for ${type} with ID ${uniqueId}`);
          return JSON.parse(cachedData);
        }

        // Parse and store in cache
        console.log(`Parsing and caching data for ${type}`);
        const parsedData = parserFunction(xmlString);

        // If no uniqueId, generate one and set it as a button attribute
        if (!uniqueId) {
          uniqueId = Math.random().toString(36).substr(2, 9); // Generate unique ID
          $(button).attr("data-id", uniqueId); // Add to button
          $(button).attr("data-type", type); // Ensure type is set
        }

        // Store in localStorage
        const newCacheKey = `cache_${type}_${uniqueId}`;
        localStorage.setItem(newCacheKey, JSON.stringify(parsedData));
        return parsedData;
      }

      // minimize and drag modal=======================================

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

      //=======================================================================================================
    } // End if statement
  }; // End draw function
  return App;
}); // End define function

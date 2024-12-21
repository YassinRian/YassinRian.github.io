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

      // Button click event=======================================

      $("#button_parse").on("click", () => {
        const button = this;
        const selectedType = $("#select_parse_type").val(); // Get selected type
        const xmlData = this.xml_data; // XML data source

        // Ensure the button has a valid type set
        $(this).attr("data-type", selectedType);

        // Parse or retrieve cached data
        const parsedData = parseAndCache(this, xmlData);

        // Render the table
        tableRenderer.renderTable(parsedData, "#table_container", selectedType);
        $("#table_modal").fadeIn(150);
      });
      // cache functions=======================================

      function parseAndCache(button, xmlString) {
        // Get attributes from the button
        const type = $(button).data("type");
        let uniqueId = $(button).data("id");
        const cacheKey = `cache_${type}_${uniqueId || "new"}`;

        // Clear irrelevant caches
        clearIrrelevantCaches(type, uniqueId);
        console.log(xmlString);

        // Check if data exists in cache
        // const cachedData = localStorage.getItem(cacheKey);
        // if (cachedData && type && uniqueId) {
        //   console.log(`Using cached data for ${type} with ID ${uniqueId}`);
        //   return JSON.parse(cachedData);
        // }

        // Parse based on type
        console.log(`Parsing and caching data for ${type}`);
        let parsedData;
        switch (type) {
          case "Queries":
            parsedData = xmlParser.getQueries(xmlString);
            break;
          case "Lists":
            const queryData = xmlParser.getQueries(xmlString);
            const listData = xmlParser.getLists(xmlString);
            parsedData = xmlParser.addLabelsToList(queryData, listData);
            break;
          case "DetailFilters":
            parsedData = xmlParser.getDetailFilters(xmlString);
            break;
          default:
            throw new Error("Unknown type selected");
        }

        // Generate unique ID if not present
        if (!uniqueId) {
          uniqueId = Math.random().toString(36).substr(2, 9);
          $(button).attr("data-id", uniqueId);
          $(button).attr("data-type", type);
        }

        // Store in localStorage
        const newCacheKey = `cache_${type}_${uniqueId}`;
        localStorage.setItem(newCacheKey, JSON.stringify(parsedData));
        return parsedData;
      }

      function clearIrrelevantCaches(type, currentUniqueId) {
        Object.keys(localStorage).forEach((key) => {
          if (
            key.startsWith(`cache_${type}_`) &&
            !key.endsWith(`_${currentUniqueId}`)
          ) {
            localStorage.removeItem(key);
            console.log(`Cleared irrelevant cache: ${key}`);
          }
        });
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

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
        const button = this; // reference to the button
        const selectedType = $("#select_parse_type").val(); // Get selected type
        const xmlData = this.xml_data; // reference to the xml_data

        // Ensure the button has a valid type set
        $(button).data("type", selectedType);

        // Parse or retrieve cached data
        const parsedData = parseAndCache(button, xmlData);

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

        // Check if data exists in cache
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          console.log(`Using cached data for ${type} with ID ${uniqueId}`);
          return JSON.parse(cachedData);
        }

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
          uniqueId = Math.random().toString(36).substr(2, 9); // Generate unique ID
          $(button).data("id", uniqueId); // Set unique ID using .data()
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


// Modal logic=======================================================================================================


      const $closeModal = $modal.find(".close-modal");
      const $modal = $(".modal-content");
      let isDragging = false;
      let startX, startY, initialLeft, initialTop;

       // Close Modal=======================================     
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

      // minimize and drag modal=======================================
  
      $modal.on("mousedown", function (e) {
          // Avoid dragging when interacting with the close button
          if ($(e.target).hasClass("close-modal")) return;
  
          isDragging = true;
          startX = e.clientX;
          startY = e.clientY;
          initialLeft = $modal.offset().left;
          initialTop = $modal.offset().top;
  
          $("body").css("user-select", "none"); // Prevent text selection while dragging
      });
  
      $(document).on("mousemove", function (e) {
          if (!isDragging) return;
  
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
  
          $modal.css({
              left: initialLeft + dx + "px",
              top: initialTop + dy + "px",
              position: "absolute", // Ensure it's absolutely positioned
          });
      });
  
      $(document).on("mouseup", function () {
          if (isDragging) {
              isDragging = false;
              $("body").css("user-select", ""); // Restore text selection
          }
      });

      //=======================================================================================================
    } // End if statement
  }; // End draw function
  return App;
}); // End define function

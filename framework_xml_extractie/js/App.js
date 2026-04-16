define(["jquery", "https://yassinrian.netlify.app/framework_xml_extractie/js/UI.js", "https://yassinrian.netlify.app/framework_xml_extractie/js/Extractor.js", "https://yassinrian.netlify.app/framework_xml_extractie/js/Styles.js"], function (
  $,
  UI,
  Extractor,
  Styles,
) {
  "use strict";

  class App {
    constructor() {
      this.extractor = new Extractor();
      this.ui = null;
      this.allData = [];
      this.filteredData = [];
      this.itemsPerPage = 10;
      this.currentPage = 1;
      Styles.inject();
      this.currentLayerFilter = "all";
    }

    draw(oControlHost) {
      this.ui = new UI(oControlHost.container); ///
      this.ui.renderSkeleton();

      const $container = $(oControlHost.container);

      // 1. File Upload
      $container.on("change", "#xml-upload", (e) => this.handleUpload(e));

      // 2. Search Box
      $container.on("input", "#search-box", (e) =>
        this.handleSearch($(e.target).val()),
      );

      // 3. Load More
      $container.on("click", "#load-more", () => {
        this.currentPage++;
        this.renderCurrentPage(true);
      });

      // 4. TAB FILTER (The Fix)
      $container.on("click", ".layer-tab", (e) => {
        // Voorkom dat de browser rare dingen doet
        e.preventDefault();

        const $clickedTab = $(e.currentTarget);
        const newLayer = $clickedTab.attr("data-layer");

        // UI Update
        $container.find(".layer-tab").removeClass("active");
        $clickedTab.addClass("active");

        // Logic Update
        this.currentLayerFilter = newLayer;
        this.handleSearch($container.find("#search-box").val() || "");
      });

      $(oControlHost.container).on("click", ".toggle-view", (e) => {
        const $btn = $(e.target);
        const view = $btn.data("view");
        const $card = $btn.closest(".card");

        $card.find(".toggle-view").removeClass("active");
        $btn.addClass("active");

        if (view === "sql") {
          $card.find(".grid-view").hide();
          $card.find(".sql-view").show();
        } else {
          $card.find(".sql-view").hide();
          $card.find(".grid-view").show();
        }
      });

      $(oControlHost.container).on("click", ".copy-sql-btn", function(e) {
        // Voorkom dat de toggle (click op de container) ook afgaat!
        e.stopPropagation(); 

        const $btn = $(this);
        
        // We zoeken nu de .clean-version binnen de .sql-container die naast de button staat
        const $container = $btn.siblings(".sql-container");
        const textToCopy = $container.find(".clean-version").text();

        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = $btn.text();
            $btn.addClass("success").text("Copied!");
            
            setTimeout(() => {
                $btn.removeClass("success").text(originalText);
            }, 2000);
        }).catch(err => {
            console.error("Copy failed", err);
            $btn.text("Error!");
        });
    });


      $(oControlHost.container).on("click", ".clickable-sql", function() {
          const $container = $(this);
          const state = $container.attr("data-highlight");

          if (state === "on") {
              // Schakel highlight UIT
              $container.find(".highlighted-version").hide();
              $container.find(".clean-version").show();
              $container.attr("data-highlight", "off");
              $container.css("opacity", "0.9"); // Subtiele visuele hint
          } else {
              // Schakel highlight AAN
              $container.find(".clean-version").hide();
              $container.find(".highlighted-version").show();
              $container.attr("data-highlight", "on");
              $container.css("opacity", "1");
          }
      });


      $(oControlHost.container).on("click", ".breadcrumb-wrapper", function() {
        const $wrapper = $(this);
        const $collapsed = $wrapper.find(".path-collapsed");
        const $expanded = $wrapper.find(".path-expanded");

        if ($collapsed.is(":visible")) {
            $collapsed.hide();
            $expanded.fadeIn(100);
        } else {
            $expanded.hide();
            $collapsed.fadeIn(100);
        }
    });


    }

    handleSearch(term = "") {
      this.currentPage = 1;
      const searchParts = term
        .split("::")
        .map((p) => p.trim())
        .filter((p) => p !== "");

      let results = this.allData.filter((item) => {
        return (
          this.currentLayerFilter === "all" ||
          item.layer === this.currentLayerFilter
        );
      });

      searchParts.forEach((part) => {
        let regex = null;
        try {
          // We checken of het een geldige Regex is.
          // Bijv: ^dim_ of [0-9]+
          regex = new RegExp(part, "i");
        } catch (e) {
          regex = null; // Ongeldige regex, gebruik normale string match
        }

        results = results.filter((item) => {
          const check = (val) =>
            regex
              ? regex.test(val)
              : val.toLowerCase().includes(part.toLowerCase());

          return (
            check(item.name) ||
            check(item.sql) ||
            item.columns.some((c) => check(c.name)) ||
            check(item.folder)
          );
        });
      });

      this.filteredData = results;
      this.renderCurrentPage(false);
    }

    renderCurrentPage(append = false) {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;

      // Grab the specific items for this page
      const pageItems = this.filteredData.slice(start, end);

      // Send to UI
      this.ui.displayModel(pageItems, append);

      // Boolean check: is the end of the window still inside the total list
      const hasMore = end < this.filteredData.length;

      // Show/Hide "Load More" button
      $("#pagination-controls").toggle(hasMore);

      this.ui.updateStatus(
        `Showing ${Math.min(end, this.filteredData.length)} of ${this.filteredData.length} results.`,
      );
    }

    async handleUpload(e) {
      const file = e.target.files[0];
      if (!file) return;

      this.ui.updateStatus("Bezig met verwerken...");

      try {
        await this.extractor.parseFile(file);

        // Collect all layers

        const dataLayer = this.extractor
          .getLayerData("Datalaag")
          .map((item) => ({
            ...item,
            layer: "Data",
          }));
        const modelLayer = this.extractor
          .getLayerData("Modellaag")
          .map((item) => ({
            ...item,
            layer: "Model",
          }));


        // Store for later use in search
        this.allData = [...dataLayer, ...modelLayer];
        this.filteredData = this.allData;
        this.currentPage = 1;
        this.renderCurrentPage(false);
      } catch (err) {
        this.ui.updateStatus("Fout: " + err.message);
        console.error(err);
      }
    }
  }

  return App;
});

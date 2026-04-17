define(["jquery", "https://yassinrian.netlify.app/framework_xml_extractie/js/UI.js", "https://yassinrian.netlify.app/framework_xml_extractie/js/Extractor.js", "https://yassinrian.netlify.app/framework_xml_extractie/js/Styles.js", "https://yassinrian.netlify.app/framework_xml_extractie/js/TimeMachine.js"], function (
  $,
  UI,
  Extractor,
  Styles,
  TimeMachine
) {
  "use strict";

  class App {
    constructor() {
      this.extractor = new Extractor();
      this.timeMachine = new TimeMachine();
      this.ui = null;
      this.allData = [];
      this.filteredData = [];
      this.itemsPerPage = 10;
      this.currentPage = 1;
      Styles.inject();
      this.currentLayerFilter = "all";
      this.aliasMap = {};
    }

    draw(oControlHost) {
      this.ui = new UI(oControlHost.container, this); ///
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

      // 5. SQL/GRID view

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

      // 6. COPY SQL

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

      // 7. HIGHLIGHT ON/OFF
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

      // 8. BREADCRUMB VIEWER
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

    // 9. Time Travel Filter (Nieuw!)
        $container.on("change", "#time-range-select", (e) => {
            const val = e.target.value;
            if (val === "all") {
                this.timeMachine.reset();
                $("#time-info-msg").text("");
            } else {
                this.timeMachine.setRange(parseInt(val));
                $("#time-info-msg").text(`Changes since ${this.timeMachine.startDate.toLocaleDateString()}`);
            }
            this.handleSearch($("#search-box").val());
        });


// Toggle het menu
$container.on("click", "#export-main-btn", (e) => {
    e.stopPropagation();
    $("#export-menu").fadeToggle(150);
});

// Sluit het menu als je ergens anders klikt
$(document).on("click", () => {
    $("#export-menu").fadeOut(150);
});

// Voorkom dat het menu sluit als je binnen het menu klikt (voor de file-upload)
$container.on("click", "#export-menu", (e) => {
    e.stopPropagation();
});

// De bestaande export handlers blijven hetzelfde
$container.on("click", "#export-tech-sql", () => this.handleTechnicalExport(false));

$container.on("click", "#export-custom-sql", () => {
    // Forceer een leeg object {} als er geen map geladen is, zodat de generator 
    // weet dat we in 'Custom Mode' zitten en niet in 'Technical Mode'.
    const mapToUse = this.aliasMap || {}; 
    this.handleTechnicalExport(true, mapToUse); 
});


// upload alias-map file
$container.on("change", "#alias-map-upload", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const lines = event.target.result.split(/\r?\n/);
        
        // We overschrijven het lege object met de nieuwe data
        this.aliasMap = {}; 
        lines.forEach(line => {
            const [oldAlias, newAlias] = line.split("|").map(s => s?.trim());
            if (oldAlias && newAlias) {
                this.aliasMap[oldAlias.toLowerCase()] = newAlias;
            }
        });
        
        this.ui.updateStatus(`Alias map geladen: ${Object.keys(this.aliasMap).length} items.`);
    };
    reader.readAsText(file);
});


// --- Modal Interactie ---

// 1. Open de modal
$container.on("click", "#help-trigger", () => {
    // We gebruiken flex om de modal netjes te centreren, 
    // hide/fadeIn voor een vloeiende overgang.
    $container.find("#help-modal").css("display", "flex").hide().fadeIn(200);
});

// 2. Sluit de modal (via het kruisje of de 'Begrepen' knop)
$container.on("click", "#close-modal, #close-modal-btn", () => {
    $container.find("#help-modal").fadeOut(200);
});

// 3. Sluit de modal als de gebruiker buiten het witte vlak klikt
$container.on("click", "#help-modal", (e) => {
    // Alleen sluiten als er op de donkere overlay zelf wordt geklikt
    if (e.target.id === "help-modal") {
        $(e.target).fadeOut(200);
    }
});



    }

handleSearch(term = "") {
    this.currentPage = 1;

    // 1. TIJD FILTER (Nieuw!)
    // We laten de TimeMachine eerst de lijst uitdunnen
    let results = this.timeMachine.isActive 
        ? this.timeMachine.filterData(this.allData) 
        : this.allData;

    // 2. LAAG FILTER
    results = results.filter((item) => {
        return (
            this.currentLayerFilter === "all" ||
            item.layer === this.currentLayerFilter
        );
    });

    // 3. TEKST SEARCH (Bestaande :: logica)
    const searchParts = term
        .split("::")
        .map((p) => p.trim())
        .filter((p) => p !== "");

    searchParts.forEach((part) => {
        let regex = null;
        try {
            regex = new RegExp(part, "i");
        } catch (e) {
            regex = null;
        }

        results = results.filter((item) => {
            const check = (val) =>
                regex
                    ? regex.test(val)
                    : (val || "").toLowerCase().includes(part.toLowerCase());

            return (
                check(item.name) ||
                check(item.sql) ||
                item.columns.some((c) => check(c.name)) ||
                check(item.fullPath) // Gebruik fullPath voor betere context
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


handleTechnicalExport(useCustomAlias = false, mapToUse = null) {
    // Check of we data hebben
    if (!this.filteredData || this.filteredData.length === 0) {
        alert("Er zijn geen resultaten om te exporteren. Upload eerst een model of pas je zoekterm aan.");
        return;
    }

    // Check of er een map is als de gebruiker de custom knop gebruikt
    if (useCustomAlias && Object.keys(this.aliasMap || {}).length === 0) {
        if (!confirm("Geen alias-map geladen. Wil je doorgaan met de standaard aliassen?")) {
            return;
        }
    }

    const modeText = useCustomAlias ? "Custom Alias" : "Technische";
    this.ui.updateStatus(`Bezig met genereren van ${modeText} export...`);

    let exportContent = `-- Cognos Framework Manager ${modeText} Export\n`;
    exportContent += `-- Genereerd op: ${new Date().toLocaleString()}\n`;
    exportContent += `-- Filter: ${$("#search-box").val() || "Geen"}\n`;
    exportContent += `--------------------------------------------------\n\n`;

    let exportCount = 0;

    this.filteredData.forEach(table => {
        if (table.layer === "Model") {
            // WE GEVEN HIER DE ALIASMAP MEE (als useCustomAlias true is)
            const techSql = this.ui.generateTechnicalExportSQL(
                table, 
                mapToUse
            );

            if (techSql) {
                exportContent += `/* Table: ${table.name} */\n`;
                exportContent += `/* Path: ${table.fullPath} */\n`;
                exportContent += techSql + ";\n\n";
                exportContent += `--------------------------------------------------\n\n`;
                exportCount++;
            }
        }
    });

    if (exportCount === 0) {
        alert("Geen Modellaag tabellen gevonden in de huidige selectie.");
        return;
    }

    // Bestandsnaam bepalen op basis van de modus
    const fileNamePrefix = useCustomAlias ? "Cognos_Custom_Alias" : "Cognos_Tech_Export";
    
    const blob = new Blob([exportContent], { type: 'text/sql' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileNamePrefix}_${new Date().toISOString().slice(0,10)}.sql`;
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    this.ui.updateStatus(`Export voltooid! ${exportCount} tabellen geëxporteerd.`);
}








  }

  return App;
});

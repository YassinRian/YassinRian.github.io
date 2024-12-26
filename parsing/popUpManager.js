define(["jquery"], function ($) {
  class PopupManager {
    constructor() {
      this.isOverIcon = false;
      this.isOverPopup = false;
      this.activePopup = null;
      this.hideDelay = 300;
    }

    // Data analysis methods
    analyzeData(data) {
      const nameMap = new Map();
      let total = 0;

      // Count occurrences of item names
      data.forEach((item) => {
        const name = item.name.trim();
        nameMap.set(name, (nameMap.get(name) || 0) + 1);
        total++;
      });

      const sortedNames = Array.from(nameMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({
          value: name || "(empty)",
          count,
          percentage: ((count / total) * 100).toFixed(1),
        }));

      return {
        uniqueCount: nameMap.size,
        total,
        distribution: sortedNames
      };
    }

    // HTML generation methods
    generateSummaryHTML(analysis) {
      return `
        <div style="margin-bottom: 10px;">
          <strong>Total Unique Names:</strong> ${analysis.uniqueCount}<br>
          <strong>Total Occurrences:</strong> ${analysis.total}
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Name Distribution:</strong>
        </div>
      `;
    }

    generateTableHTML(analysis) {
      const table = $('<table style="width: 100%; border-collapse: collapse;"></table>');
      
      table.append(`
        <tr style="background-color: #f5f5f5;">
          <th>Name</th>
          <th>Count</th>
          <th>%</th>
        </tr>
      `);

      analysis.distribution.forEach((item) => {
        table.append(`
          <tr>
            <td>${item.value}</td>
            <td>${item.count}</td>
            <td>${item.percentage}%</td>
          </tr>
        `);
      });

      return table;
    }

    calculatePosition(element) {
      const rect = element[0].getBoundingClientRect();
      return {
        left: `${rect.left}px`,
        top: `${rect.bottom + window.scrollY}px`
      };
    }

    createPopupElement(content, position) {
      return $('<div class="column-popup"></div>')
        .css({
          position: "fixed",
          left: position.left,
          top: position.top,
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "10px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          zIndex: 1000,
          maxWidth: "400px",
          maxHeight: "400px",
          overflowY: "auto",
        })
        .append(content);
    }

    // Popup visibility methods
    shouldHidePopup() {
      return !this.isOverIcon && !this.isOverPopup;
    }

    hidePopupWithDelay() {
      if (this.shouldHidePopup() && this.activePopup) {
        setTimeout(() => {
          if (this.shouldHidePopup()) {
            this.hidePopup();
          }
        }, this.hideDelay);
      }
    }

    hidePopup() {
      if (this.activePopup) {
        this.activePopup.remove();
        this.activePopup = null;
      }
    }

    showPopup(data, element) {
      this.hidePopup();
      this.isOverIcon = true;

      // Analyze data
      const analysis = this.analyzeData(data);

      // Generate content
      const content = $('<div></div>')
        .append(this.generateSummaryHTML(analysis))
        .append(this.generateTableHTML(analysis));

      // Calculate position and create popup
      const position = this.calculatePosition(element);
      this.activePopup = this.createPopupElement(content, position);

      // Add to DOM and setup events
      $("body").append(this.activePopup);
      this.setupPopupEvents();

      return this.activePopup;
    }

    setupPopupEvents() {
      if (!this.activePopup) return;

      this.activePopup
        .on("mouseenter", () => {
          this.isOverPopup = true;
        })
        .on("mouseleave", () => {
          this.isOverPopup = false;
          this.hidePopupWithDelay();
        });
    }
  }

  // Setup function for easy initialization
  function setupAnalysisIcon(th, data) {
    if (!th.find('.analysis-icon').length) return;

    const popupManager = new PopupManager();

    th.find('.analysis-icon').on("mouseenter", function(e) {
      popupManager.showPopup(data, $(this));
    }).on("mouseleave", function() {
      popupManager.isOverIcon = false;
      popupManager.hidePopupWithDelay();
    });
  }

  // Export both the class and setup function
  return {
    PopupManager,
    setupAnalysisIcon
  };
});
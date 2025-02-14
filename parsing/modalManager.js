define(["jquery"], function ($) {
  
  
  const csvUtils = {
    convertToCSV(data) {
      if (!data.length) return '';
      
      // Get headers from the first row
      const headers = Object.keys(data[0]);
      const csvRows = [];
      
      // Add headers
      csvRows.push(headers.join(','));
      
      // Add data rows
      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header] ?? ''; // Use nullish coalescing for null/undefined
          const stringValue = String(value).trim();
          
          // Escape commas and quotes, wrap in quotes if needed
          return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
            ? `"${stringValue.replace(/"/g, '""')}"` 
            : stringValue;
        });
        csvRows.push(values.join(','));
      });
      
      return csvRows.join('\n');
    },
    
    downloadCSV(csvContent, filename) {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  
  class ModalManager {
    
    constructor(options = {}) {
      // Core modal properties
      this.modal = null;
      this.isVisible = false;
      this.tableRenderer = options.tableRenderer;
      
      // Drag state properties
      this.dragState = {
        isDragging: false,
        startX: 0,
        startY: 0,
        initialX: 0,
        initialY: 0
      };

      // Initialize styles
      this.setupStyles();
    }


    exportToCSV(data, type) {
      try {
        const csvContent = csvUtils.convertToCSV(data);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${type}_export_${timestamp}.csv`;
        
        csvUtils.downloadCSV(csvContent, filename);
      } catch (error) {
        console.error('Error exporting to CSV:', error);
        alert('An error occurred while exporting to CSV. Please try again.');
      }
    }

    setupStyles() {
      if (!$("#modal-manager-styles").length) {
        const styles = `
            <style id="modal-manager-styles">
          .data-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
          }

        .modal-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 24px;
            border-radius: 8px;
            width: 70%;    /* Initial width */
            max-width: none; /* Remove any max-width constraints */
            height: 90vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            resize: both;
            overflow: auto;
        }

          /* Ensure modal stays within viewport */
          @media screen and (max-width: 1400px) {
            .modal-content {
              max-width: 95vw;
            }
          }

          @media screen and (max-width: 640px) {
            .modal-content {
              min-width: 95vw;
            }
          }

          .modal-header {
            cursor: move;
            user-select: none;
            display: flex;
            justify-content: space-between;
          }

          .modal-content::after {
              content: '';
              position: absolute;
              bottom: 3px;
              right: 3px;
              width: 12px;
              height: 12px;
              background-image: radial-gradient(circle, #666 2px, transparent 2px);
              background-size: 4px 4px;
              opacity: 0.7;
              transition: opacity 0.2s;
          }

          .modal-content:hover::after {
              opacity: 1;
          }

          .modal-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #333;
            margin: 0;
          }

          .modal-close {
            cursor: pointer;
            font-size: 28px;
            color: #666;
            transition: color 0.2s;
            padding: 4px;
          }

          .modal-close:hover {
            color: #333;
          }

          .modal-body {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0; /* Important for nested scrolling */
          }

          /* Search Container */
          .search-container {
              display: flex;
              align-items: center;
              gap: 10px; /* Space between elements */
              margin-bottom: 15px; /* Add some spacing below the input */
              padding: 10px;
              background-color: #f9f9f9; /* Light background for input container */
              border: 1px solid #ddd; /* Border for the container */
              border-radius: 8px; /* Rounded corners */
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow */
          }

          /* Search Input */
          #searchInput {
              flex: 1; /* Make input take up available space */
              padding: 10px 15px;
              font-size: 16px;
              border: 1px solid #ccc;
              border-radius: 5px;
              outline: none;
              transition: all 0.3s ease;
          }

          /* Focus State for Input */
          #searchInput:focus {
              border-color: #007bff; /* Blue border on focus */
              box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); /* Glow effect */
          }

          #searchInput::placeholder {
            color:rgba(146, 152, 158, 0.85);
            font-size: 13px;
          }

          .checkbox-container {
            display: flex;
            align-items: center;
            font-size: 14px;
            color: #495057;
            cursor: pointer;
            padding: 4px 0;
          }

          .checkbox-container input[type="checkbox"] {
            margin-right: 8px;
            cursor: pointer;
            width: 16px;
            height: 16px;
            accent-color: #007bff;
          }

          #tableContainer {
            flex: 1;
            overflow-y: auto;
            overflow-x: auto;
            min-height: 0; /* Important for scrolling */
            border: 1px solid #e9ecef;
            border-radius: 4px;
          }

          /* Scrollbar styling */
          #tableContainer::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          #tableContainer::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }

          #tableContainer::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
          }

          #tableContainer::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }
            </style>
          `;
        $("head").append(styles);
      }
    }

    setupDragHandlers() {
      const modalContent = this.modal.find(".modal-content");
      const header = modalContent.find(".modal-header");

      header.on("mousedown", (e) => {
        // Prevent dragging on close button click
        if ($(e.target).hasClass("modal-close")) return;

        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;

        const rect = modalContent[0].getBoundingClientRect();
        this.initialX = rect.left;
        this.initialY = rect.top;

        // Remove transform to work with absolute positioning
        modalContent.css({
          transform: "none",
          top: this.initialY + "px",
          left: this.initialX + "px",
        });
      });

      $(document).on("mousemove", (e) => {
        if (!this.isDragging) return;

        const dx = e.clientX - this.dragStartX;
        const dy = e.clientY - this.dragStartY;

        modalContent.css({
          left: this.initialX + dx + "px",
          top: this.initialY + dy + "px",
        });
      });

      $(document).on("mouseup", () => {
        this.isDragging = false;
      });

      // Prevent text selection while dragging
      header.on("selectstart", (e) => {
        if (this.isDragging) e.preventDefault();
      });
    }

    createModal() {
      this.modal = $(`
          <div class="data-modal">
            <div class="modal-content">
              <div class="modal-header">
                <h3 class="modal-title">Data View</h3>
                <span class="modal-close">&times;</span>
              </div>
              <div class="modal-body"></div>
            </div>
          </div>
        `);

      this.setupEventHandlers();
      this.setupDragHandlers();
      $("body").append(this.modal);
    }

  setupEventHandlers() {
      const modalContent = this.modal.find(".modal-content");
      
      // Setup all closing-related handlers
      this.setupCloseHandlers();
      
      // Setup viewport constraints
      this.setupViewportConstraints(modalContent);
    }
  
    setupCloseHandlers() {
      // Close button click
      this.modal.find(".modal-close").on("click", () => this.hide());
  
      // Click outside modal
      this.modal.on("click", (e) => {
        if ($(e.target).is(this.modal)) {
          this.hide();
        }
      });
  
      // Escape key
      $(document).on("keydown", (e) => {
        if (e.key === "Escape" && this.isVisible) {
          this.hide();
        }
      });
    }
  
    setupViewportConstraints(modalContent) {
      $(window).on("resize", () => {
        if (!this.isVisible) return;
  
        const rect = modalContent[0].getBoundingClientRect();
        
        // Keep modal within viewport bounds
        if (rect.right > window.innerWidth) {
          modalContent.css("left", `${window.innerWidth - rect.width - 20}px`);
        }
        if (rect.bottom > window.innerHeight) {
          modalContent.css("top", `${window.innerHeight - rect.height - 20}px`);
        }
      });
    }
  
    hide() {
      this.modal.fadeOut(200);
      this.isVisible = false;
    }


    show() {
      if (!this.modal) {
        this.createModal();
      }

      const modalContent = this.modal.find(".modal-content");

      // Only set initial position if not already positioned
      if (!modalContent.attr("style")) {
        modalContent.css({
          transform: "translate(-50%, -50%)",
        });
      }

      this.modal.fadeIn(200);
      this.isVisible = true;
    }

    hide() {
      if (this.modal) {
        this.modal.fadeOut(100);
        this.isVisible = false;
      }
    }

    setTitle(title) {
      if (this.modal) {
        this.modal.find(".modal-title").text(title);
      }
    }

    setContent(content) {
      if (this.modal) {
        this.modal.find(".modal-body").html(content);
      }
    }

    renderTable(data, type) {
      this.setTitle(`${type} View`);
      const tableContainer = $('<div id="tableContainer"></div>');
      const searchInput = $(`
        <div class="search-container">
            <div style="flex: 1; display: flex; gap: 10px;">
                <input id="searchInput" type="text" placeholder="Gebruik '::' om specifieker op kolommen te zoek (bijv. zoekterm1::zoekterm2::zoekterm3)" />
                <button id="exportCSV" class="export-button">
                    Export CSV
                </button>
            </div>
            
            <label class="checkbox-container">
                <input type="checkbox" id="regexToggle" />
                Use Regular Expression
            </label>
        </div>
      `);

      this.show();
      this.setContent(tableContainer);

      if (this.tableRenderer) {
        this.tableRenderer.renderTable(
          data,
          "#tableContainer",
          type,
          searchInput
        );

      // Setup CSV export functionality
       $('#exportCSV').on('click', () => this.exportToCSV(data, type));
      }
    }
  } // ModalManager

  return {
    ModalManager,
  };
});

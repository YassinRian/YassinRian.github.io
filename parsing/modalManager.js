define(["jquery"], function ($) {
  class ModalManager {
    constructor(options = {}) {
      this.modal = null;
      this.isVisible = false;
      this.tableRenderer = options.tableRenderer;
      this.setupStyles();
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
            overflow: hidden;
          }

          .modal-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 24px;
            border-radius: 8px;
            width: 90%;
            max-width: 1200px;
            height: 90vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e9ecef;
          }

          .modal-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #333;
            margin: 0;
          }

          .modal-close {
            cursor: pointer;
            font-size: 24px;
            color: #666;
            transition: color 0.2s;
            padding: 4px;
          }

          .modal-close:hover {
            color: #333;
          }

          .modal-body {
            flex: 1;
            overflow-y: auto;
            padding-right: 8px;
            /* Hide scrollbar but keep functionality */
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE and Edge */
          }

          /* Hide scrollbar for Chrome, Safari and Opera */
          .modal-body::-webkit-scrollbar {
            display: none;
          }

           .search-container {
            margin-bottom: 20px;
            width: 100%;
          }

          #searchInput {
            width: 100%;
            padding: 12px 16px;
            font-size: 14px;
            border: 1px solid #ddd;
            border-radius: 6px;
            transition: border-color 0.2s, box-shadow 0.2s;
            box-sizing: border-box;
            margin-bottom: 8px;
          }

          #searchInput:focus {
            outline: none;
            border-color: #80bdff;
            box-shadow: 0 0 0 3px rgba(0,123,255,.25);
          }

          #searchInput::placeholder {
            color: #adb5bd;
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
          }

          /* Improve checkbox appearance */
          .checkbox-container input[type="checkbox"] {
            width: 16px;
            height: 16px;
            accent-color: #007bff;
          }

          /* Add hover effect for the entire checkbox label */
          .checkbox-container:hover {
            color: #000;
          }
            </style>
          `;
        $("head").append(styles);
      }
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
      $("body").append(this.modal);
    }

    setupEventHandlers() {
      // Close button handler
      this.modal.find(".modal-close").on("click", () => this.hide());

      // Click outside modal handler
      this.modal.on("click", (e) => {
        if ($(e.target).hasClass("data-modal")) {
          this.hide();
        }
      });

      // Escape key handler
      $(document).on("keydown", (e) => {
        if (e.key === "Escape" && this.isVisible) {
          this.hide();
        }
      });
    }

    show() {
      if (!this.modal) {
        this.createModal();
      }
      this.modal.fadeIn(200);
      this.isVisible = true;
    }

    hide() {
      if (this.modal) {
        this.modal.fadeOut(200);
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
            <input id="searchInput" type="text" placeholder="Enter search terms column-by-column using '::' (e.g., 'term1::term2::term3')" />
            <label class="checkbox-container">
                <input type="checkbox" id="regexToggle" />
                Use Regular Expression
            </label>
        </div>
      `);

      this.show();
      this.setContent(tableContainer);
      
      if (this.tableRenderer) {
        this.tableRenderer.renderTable(data, '#tableContainer', type, searchInput);
      }
    }
  
  
  } // ModalManager

  return {
    ModalManager,
  };
});

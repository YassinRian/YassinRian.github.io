define(["jquery"], function ($) {
    class ModalManager {
      constructor() {
        this.modal = null;
        this.isVisible = false;
        this.tableRenderer = null;
        this.setupStyles();
      }
  
      setupStyles() {
        if (!$('#modal-manager-styles').length) {
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
                padding: 20px;
                border-radius: 8px;
                width: 90%;
                max-width: 1200px;
                max-height: 90vh;
                overflow-y: auto;
              }
              .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #dee2e6;
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
                padding: 5px;
              }
              .modal-close:hover {
                color: #333;
              }
              .modal-body {
                max-height: calc(90vh - 100px);
                overflow-y: auto;
              }
            </style>
          `;
          $('head').append(styles);
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
        $('body').append(this.modal);
      }
  
      setupEventHandlers() {
        // Close button handler
        this.modal.find('.modal-close').on('click', () => this.hide());
  
        // Click outside modal handler
        this.modal.on('click', (e) => {
          if ($(e.target).hasClass('data-modal')) {
            this.hide();
          }
        });
  
        // Escape key handler
        $(document).on('keydown', (e) => {
          if (e.key === 'Escape' && this.isVisible) {
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
          this.modal.find('.modal-title').text(title);
        }
      }
  
      setContent(content) {
        if (this.modal) {
          this.modal.find('.modal-body').html(content);
        }
      }
  
      renderTable(data, type) {
        this.setTitle(`${type} View`);
        const tableContainer = $('<div id="tableContainer"></div>');
        const searchInput = $(`
          <div style="margin-bottom: 15px;">
            <input type="text" 
                   id="searchInput" 
                   placeholder="Search..." 
                   style="padding: 8px; width: 200px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
        `);
        
        this.setContent(tableContainer);
        this.show();
        
        // Initialize table renderer with the container
        if (this.tableRenderer) {
          this.tableRenderer.renderTable(data, '#tableContainer', type, searchInput);
          console.log("Table renderer functie moet nu uitgevoerd worden");
        }
      }
    }
  
    // Helper function to initialize modal functionality
    function initializeModal(tableRenderer) {
      const modalManager = new ModalManager();
      modalManager.tableRenderer = tableRenderer; // set table renderer for modal manager
  
      // Handle parse button click
      $('#button_parse').on('click', function() {
        const selectedType = $('#select_parse_type').val();
        const data = getDataForType(selectedType); // You'll need to implement this
        modalManager.renderTable(data, selectedType);
      });
  
      return modalManager;
    }
  
    return {
      ModalManager,
      initializeModal
    };
  });
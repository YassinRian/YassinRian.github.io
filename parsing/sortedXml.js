define(['jquery'], function($) {
  function sortXmlDataItems(xmlData) {
    try {
      // Parse XML if it's a string
      const xmlDoc = typeof xmlData === 'string' 
        ? new DOMParser().parseFromString(xmlData, 'text/xml')
        : xmlData;

      // Find all query elements
      const queries = xmlDoc.getElementsByTagName('query');

      Array.from(queries).forEach(query => {
        // Find the selection element within each query
        const selection = query.getElementsByTagName('selection')[0];
        if (!selection) return;

        // Get all dataItems but maintain their XML nodes in original document
        const dataItems = Array.from(selection.getElementsByTagName('dataItem'));
        if (dataItems.length === 0) return;

        // Sort the dataItems array by name attribute
        dataItems.sort((a, b) => {
          const nameA = a.getAttribute('name') || '';
          const nameB = b.getAttribute('name') || '';
          return nameA.localeCompare(nameB);
        });

        // Create a document fragment to hold sorted items
        const fragment = xmlDoc.createDocumentFragment();
        
        // Append sorted items to fragment
        dataItems.forEach(item => {
          // Important: Use cloneNode(true) to preserve all child elements and attributes
          fragment.appendChild(item.cloneNode(true));
        });

        // Clear only dataItems from selection
        const oldDataItems = selection.getElementsByTagName('dataItem');
        while (oldDataItems.length > 0) {
          oldDataItems[0].parentNode.removeChild(oldDataItems[0]);
        }

        // Insert sorted dataItems back
        selection.appendChild(fragment);
      });

      // Convert back to string if input was string
      return typeof xmlData === 'string' 
        ? new XMLSerializer().serializeToString(xmlDoc)
        : xmlDoc;

    } catch (error) {
      console.error('Error sorting XML data items:', error);
      return xmlData; // Return original on error
    }
  }

  // Ensure styles are added only once
  if (!$('#xml-export-styles').length) {
    $('head').append(`
      <style id="xml-export-styles">
        .xml-modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1000;
        }
        .xml-modal-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          width: 80%;
          max-width: 800px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
        }
        .xml-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .xml-modal-close {
          cursor: pointer;
          font-size: 20px;
          color: #666;
        }
        .xml-modal-close:hover {
          color: #333;
        }
        .xml-textarea {
          width: 100%;
          height: 400px;
          margin-bottom: 15px;
          padding: 10px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          font-family: monospace;
          resize: vertical;
        }
        .copy-button {
          align-self: flex-end;
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .copy-button:hover {
          background-color: #0056b3;
        }
        .copy-button.copied {
          background-color: #28a745;
        }

        /* Export button specific styles */
        .export-button {
          display: inline-flex;
          align-items: center;
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
          font-weight: 500;
        }
        .export-button:hover {
          background-color: #0056b3;
        }
        .export-icon {
          margin-right: 6px;
        }
      </style>
    `);
  }

  return {
    initExportButton: function(oControlHost) {
      // Remove any existing modal
      $('.xml-modal').remove();
      
      // Add modal HTML
      const modalHtml = `
        <div class="xml-modal">
          <div class="xml-modal-content">
            <div class="xml-modal-header">
              <h3>Sorted XML Data</h3>
              <span class="xml-modal-close">×</span>
            </div>
            <textarea class="xml-textarea" readonly></textarea>
            <button class="copy-button">Copy to Clipboard</button>
          </div>
        </div>
      `;
      
      // Append modal to body
      $('body').append(modalHtml);

      // Handle export button click
      $('#xmlExportBtn').on('click', function() {
        console.log('Export button clicked');
        try {
          const xmlData = oControlHost.page.application.document.GetReportXml();
          console.log('XML data retrieved');
          
          const sortedXml = sortXmlDataItems(xmlData);
          console.log('XML data sorted');
          
          $('.xml-textarea').val(sortedXml);
          $('.xml-modal').fadeIn(200);
          console.log('Modal should be visible now');
          
        } catch (error) {
          console.error('Error processing XML:', error);
          alert('Error processing XML data. Please check the console for details.');
        }
      });

      // Ensure event handlers are properly bound
      $(document).on('click', '.xml-modal-close', function() {
        console.log('Close button clicked');
        $('.xml-modal').fadeOut(200);
      });

      $(document).on('click', '.xml-modal', function(e) {
        if ($(e.target).hasClass('xml-modal')) {
          console.log('Clicked outside modal');
          $('.xml-modal').fadeOut(200);
        }
      });

      $(document).on('click', '.copy-button', function() {
        console.log('Copy button clicked');
        const textarea = $('.xml-textarea')[0];
        textarea.select();
        document.execCommand('copy');
        
        const button = $(this);
        button.text('Copied!').addClass('copied');
        setTimeout(() => {
          button.text('Copy to Clipboard').removeClass('copied');
        }, 2000);
      });

      // Log setup complete
      console.log('XML export functionality initialized');
    }
  };
});
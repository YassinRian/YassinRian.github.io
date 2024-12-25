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
  
    // Rest of the code remains the same...
    
    return {
      addButton: function(oControlHost, targetContainer) {
        // Add modal HTML if it doesn't exist
        if (!$('.xml-modal').length) {
          $('body').append(`
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
          `);
        }
  
        // Create and add the export button
        const exportButton = $(`
          <button class="export-button">
            <span class="export-icon">📤</span>
            Export Sorted XML
          </button>
        `);
        $(targetContainer).append(exportButton);
  
        // Handle button click
        exportButton.on('click', function() {
          try {
            const xmlData = oControlHost.page.application.document.GetReportXml();
            const sortedXml = sortXmlDataItems(xmlData);
            
            $('.xml-textarea').val(sortedXml);
            $('.xml-modal').fadeIn(200);
          } catch (error) {
            console.error('Error processing XML:', error);
            alert('Error processing XML data. Please check the console for details.');
          }
        });
  
        // Handle modal close
        $('.xml-modal-close').on('click', function() {
          $('.xml-modal').fadeOut(200);
        });
  
        // Close modal when clicking outside
        $('.xml-modal').on('click', function(e) {
          if ($(e.target).hasClass('xml-modal')) {
            $('.xml-modal').fadeOut(200);
          }
        });
  
        // Handle copy button
        $('.copy-button').on('click', function() {
          const textarea = $('.xml-textarea')[0];
          textarea.select();
          document.execCommand('copy');
          
          const button = $(this);
          button.text('Copied!').addClass('copied');
          setTimeout(() => {
            button.text('Copy to Clipboard').removeClass('copied');
          }, 2000);
        });
      }
    };
  });
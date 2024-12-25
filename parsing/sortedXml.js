define([], function () {
    return 
    function addXmlExportButton(oControlHost, targetContainer) {
        // Add required styles
        const styles = `
          <style>
            .export-button {
              display: inline-flex;
              align-items: center;
              padding: 8px 12px;
              background-color: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 4px;
              cursor: pointer;
              transition: all 0.2s;
              margin: 5px;
            }
            .export-button:hover {
              background-color: #e9ecef;
            }
            .export-icon {
              margin-right: 6px;
            }
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
          </style>
        `;
      
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
      
        // Add elements to the page
        $(targetContainer).append(styles);
        $('body').append(modalHtml);
      
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
            // Get and sort the XML
            const xmlData = oControlHost.page.application.document.GetReportXml();
            const sortedXml = sortXmlDataItems(xmlData);
      
            // Format the XML with proper indentation
            const formattedXml = formatXml(sortedXml);
      
            // Show modal with formatted XML
            $('.xml-textarea').val(formattedXml);
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
          
          // Visual feedback
          const button = $(this);
          button.text('Copied!').addClass('copied');
          setTimeout(() => {
            button.text('Copy to Clipboard').removeClass('copied');
          }, 2000);
        });
      
        // Helper function to format XML with indentation
        function formatXml(xml) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xml, 'text/xml');
          const serializer = new XMLSerializer();
          
          // Simple XML formatting function
          function format(node, level) {
            let indent = '\n' + '  '.repeat(level);
            let formatted = '';
            
            node.childNodes.forEach(child => {
              if (child.nodeType === 1) { // Element node
                formatted += indent + '<' + child.nodeName;
                
                // Add attributes
                Array.from(child.attributes).forEach(attr => {
                  formatted += ' ' + attr.name + '="' + attr.value + '"';
                });
                
                if (child.childNodes.length > 0) {
                  formatted += '>';
                  formatted += format(child, level + 1);
                  formatted += indent + '</' + child.nodeName + '>';
                } else {
                  formatted += '/>';
                }
              } else if (child.nodeType === 3) { // Text node
                let text = child.nodeValue.trim();
                if (text) {
                  formatted += indent + text;
                }
              }
            });
            
            return formatted;
          }
          
          return '<?xml version="1.0" encoding="UTF-8"?>' + format(xmlDoc.documentElement, 0);
        }
      }
      
      // Example usage:
      // addXmlExportButton(oControlHost, '#someContainer');
});
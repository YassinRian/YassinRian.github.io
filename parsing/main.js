define(['jquery', 'xmlParser', 'tableRenderer'], function($, xmlParser, tableRenderer) {
    function App() {}

    App.prototype.initialize = function(oPage, fnDoneInitializing){
        this.xml_data = oPage.page.application.document.reportXML;
        //this.userName = oPage.page.application.GlassContext.profile.account.userName;
        fnDoneInitializing();
      }

    App.prototype.draw = function(oControlHost) {
        
        const { userName } = oControlHost.configuration || ''; // Add fallback empty string
    
        if (userName === '951100') {

            const elm = oControlHost.container;
            
            $(elm).append(`
                <div>
                    <button id="button_parse">Parse XML</button>
                </div>
            `);

            $('#button_parse').on('click', () => {
                const xmlData = this.xml_data;
                
                const parsedData = xmlParser.parseXML(xmlData);
                tableRenderer.renderTable(parsedData, '#table_container');
                $('#table_modal').fadeIn(300);
                $('#table_modal .modal-content').removeClass('minimized');
                updateMinimizeButton(false);
            });
        }

        // Create modal with minimize button
        $('body').append(`
            <div id="table_modal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 1000;">
                <div class="modal-content" style="
                    position: relative; 
                    background-color: #fff; 
                    margin: 15vh auto;
                    padding: 20px; 
                    width: 80%; 
                    max-width: 1000px; 
                    border-radius: 5px; 
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    height: 70vh;
                    overflow-y: auto;
                    transition: all 0.3s ease;
                ">
                    <div style="position: absolute; right: 10px; top: 10px; z-index: 1001;">
                        <span class="minimize-modal" style="cursor: pointer; color: #666; font-size: 24px; margin-right: 15px;">─</span>
                        <span class="close-modal" style="cursor: pointer; color: #666; font-size: 24px;">&times;</span>
                    </div>
                    <div id="table_container"></div>
                </div>
            </div>
        `);

        // Add styles for minimized state
        $('<style>')
            .text(`
                .modal-content.minimized {
                    height: 40px !important;
                    overflow: hidden !important;
                    padding-top: 10px !important;
                    padding-bottom: 10px !important;
                }
                .minimize-modal.minimized {
                    transform: rotate(180deg);
                }
            `)
            .appendTo('head');

        function updateMinimizeButton(isMinimized) {
            const button = $('.minimize-modal');
            if (isMinimized) {
                button.addClass('minimized').text('─');
            } else {
                button.removeClass('minimized').text('─');
            }
        }

        // Minimize/Maximize handler
        $('.minimize-modal').on('click', function() {
            const modalContent = $('#table_modal .modal-content');
            const isMinimized = modalContent.hasClass('minimized');
            
            modalContent.toggleClass('minimized');
            updateMinimizeButton(!isMinimized);
        });

        // Close modal handler
        $('.close-modal').on('click', function() {
            $('#table_modal').fadeOut(300);
        });

        // Close modal when clicking outside
        $(window).on('click', function(event) {
            if ($(event.target).is('#table_modal')) {
                $('#table_modal').fadeOut(300);
            }
        });
    };
    return App;
});

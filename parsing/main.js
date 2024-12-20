define([
    'jquery', 
    'https://yassinrian.github.io/parsing/xmlParser.js', 
    'https://yassinrian.github.io/parsing/tableRenderer.js', 
    'https://yassinrian.github.io/parsing/tableStyles.js',
    'https://yassinrian.github.io/parsing/modalMarkup.js'], 
    function($, xmlParser, tableRenderer, tableStyles, modalMarkup) {
    
    function App() {}

    App.prototype.initialize = function(oPage, fnDoneInitializing){
        this.xml_data = oPage.page.application.document.reportXML;
        fnDoneInitializing();
    }

    App.prototype.draw = function(oControlHost) {
        const { userName } = oControlHost.configuration || ''; // Add fallback empty string

        if (userName === '951100') {
            const elm = oControlHost.container;

            // Append the modal HTML content by using the modalMarkup module
            console.log("hallo yassin");
            $(elm).append(modalMarkup);

            $('#button_parse').on('click', () => {
                const selectedType = $('#select_parse_type').val();
                const xmlData = this.xml_data;

                let parsedData;

                switch (selectedType) {
                    case 'Queries':
                        parsedData = xmlParser.getQueries(xmlData);
                        break;
                    case 'Lists':
                        const queryData = xmlParser.getQueries(xmlData);
                        const listData = xmlParser.getLists(xmlData);
                        parsedData = xmlParser.addLabelsToList(queryData, listData);
                        break;
                    case 'Detail Filters':
                        parsedData = xmlParser.getDetailFilters(xmlData);
                        break;
                    default:
                        console.error('Unknown type selected');
                        return;
                }

                tableRenderer.renderTable(parsedData, '#table_container', selectedType);
                $('#table_modal').fadeIn(300);
                $('#table_modal .modal-content').removeClass('minimized');
                updateMinimizeButton(false);
            });


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
        } // End if statement
    }

    return App;
});

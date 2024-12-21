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
            $(elm).append(modalMarkup.selectBox());
            $('body').append(modalMarkup.modal());

            $('#button_parse').on('click', () => {
                const selectedType = $('#select_parse_type').val();
                const xmlData = this.xml_data;

                let parsedData;

                switch (selectedType) {
                    case 'Queries':
                        //parsedData = xmlParser.getQueries(xmlData);
                        
                        const queriesData = parseAndCache('Queries', xmlData, xmlParser.getQueries);
                        tableRenderer.renderTable(queriesData, '#table_container', 'Queries');
                        


                        break;
                    case 'Lists':


                        //const queryData = xmlParser.getQueries(xmlData);
                        //const listData = xmlParser.getLists(xmlData);
                        //parsedData = xmlParser.addLabelsToList(queryData, listData);

                        const listsData = parseAndCache('Lists', xmlData, (xmlString) => {
                            const queryData = xmlParser.getQueries(xmlString);
                            const listData = xmlParser.getLists(xmlString);
                            return xmlParser.addLabelsToList(queryData, listData);
                        });
                        tableRenderer.renderTable(listsData, '#table_container', 'Lists');
                        

                        break;
                    case 'Detail Filters':
                        //parsedData = xmlParser.getDetailFilters(xmlData);

                        const detailFiltersData = parseAndCache('DetailFilters', xmlData, xmlParser.getDetailFilters);
                        tableRenderer.renderTable(detailFiltersData, '#table_container', 'Detail Filters');

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

            function parseAndCache(type, xmlString, parserFunction) {
                // Check if data is already cached
                const cachedData = localStorage.getItem(`cached_${type}`);
                if (cachedData) {
                    console.log(`Using cached data for ${type}`);
                    return JSON.parse(cachedData);
                }
            
                console.log(`Parsing and caching data for ${type}`);
                const parsedData = parserFunction(xmlString); // Parse XML
                localStorage.setItem(`cached_${type}`, JSON.stringify(parsedData)); // Cache the result
                return parsedData;
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

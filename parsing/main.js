define(['jquery', 'https://yassinrian.github.io/parsing/xmlParser.js', 'https://yassinrian.github.io/parsing/tableRenderer.js', 'https://yassinrian.github.io/parsing/tableStyles.js'], function($, xmlParser, tableRenderer, styleSheet) {
    
    function App() {};

    App.prototype.initialize = function(oPage, fnDoneInitializing){
        this.xml_data = oPage.page.application.document.reportXML;
        fnDoneInitializing();
      }

    App.prototype.draw = function(oControlHost) {
        const elm = oControlHost.container;

        $(elm).append(`
            <div>
                <button id="button_parse">Parse XML</button>
                <div id="table_container"></div>
            </div>
        `);

        $('#button_parse').on('click', () => {
            // Sample XML data (this can be dynamic or fetched via an API)
            const xmlData = this.xml_data;

            // Parse the XML data
            const parsedData = xmlParser.parseXML(xmlData);

            // Render the table with parsed data
            tableRenderer.renderTable(parsedData, '#table_container');
        });
    };

    return App;
});

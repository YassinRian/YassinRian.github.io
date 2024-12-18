define(['jquery', 'https://yassinrian.github.io/parsing/xmlParser.js', 'https://yassinrian.github.io/parsing/tableRenderer.js', 'https://yassinrian.github.io/parsing/tableStyles.js'], function($, xmlParser, tableRenderer, styleSheet) {
    
    function App() {};

    App.prototype.initialize = function(oPage, fnDoneInitializing){
        this.xml_data = oPage.page.application.document.reportXML;
        fnDoneInitializing();
      }

    App.prototype.draw = function(oControlHost) {
        
        console.log(window[0].Application.GlassContext.profile.account.userName)
        
        const elm = oControlHost.container;

        $(elm).append(`
            <div>
                <button id="button_parse">Parse XML</button>
            </div>
        `);

// Create modal for table only
$('body').append(`
    <div id="table_modal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 1000;">
        <div class="modal-content" style="
            position: relative; 
            background-color: #fff; 
            margin: 15vh auto;  /* 15% from top */
            padding: 20px; 
            width: 80%; 
            max-width: 1000px; 
            border-radius: 5px; 
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            height: 70vh;      /* 70% of viewport height (leaving 15% top and bottom) */
            overflow-y: auto;   /* Enable vertical scrolling */
        ">
            <span class="close-modal" style="position: absolute; right: 10px; top: 10px; font-size: 24px; cursor: pointer; color: #666; z-index: 1001;">&times;</span>
            <div id="table_container"></div>
        </div>
    </div>
`);

        $('#button_parse').on('click', () => {
            // Sample XML data (this can be dynamic or fetched via an API)
            const xmlData = this.xml_data;

            // Parse the XML data
            const parsedData = xmlParser.parseXML(xmlData);

            // Render the table with parsed data
            tableRenderer.renderTable(parsedData, '#table_container');
            $('#table_modal').fadeIn(200);
        });

         // Close modal handlers
         $('.close-modal').on('click', function() {
            $('#table_modal').fadeOut(200);
        });

        // Close modal when clicking outside
        $(window).on('click', function(event) {
            if ($(event.target).is('#table_modal')) {
                $('#table_modal').fadeOut(200);
            }
        });

    };

    return App;
});

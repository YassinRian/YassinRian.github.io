define(['https://yassinrian.github.io/basic_control2.js'], function(basicControl) {

    // Once basic_control2.js is loaded, we proceed with loading the other dependencies
    return define(['jquery', 'https://yassinrian.github.io/html_func.js'], function($, html_func_) {

        function App() {}

        // Initialize method: Now you can use basicControl since it's already loaded
        App.prototype.initialize = function(oControlHost, fnDoneInitializing) {
            let _basicControl = new basicControl();  // Create an instance of basicControl
            this.data = _basicControl.getData();  // Store the data on the instance (this)
            console.log(this.data);  // You can log the data here
            fnDoneInitializing();  // Callback to indicate initialization is done
        }

        // Draw method: Access the data in this.data
        App.prototype.draw = function(oControlHost) {
            let elm = oControlHost.container;
            console.log(this.data, "vanuit draw App.js");

            // input velden referen naar een selectie box, hier wordt de link gelegd tussen input en selectie_box
            $('#box1').data({ select_class: 'select_1' });
            $('#box2').data({ select_class: 'select_2' });

            // Set up event handlers
            $('.wis_selecties').on('click', function() {
                let class_ = $(this).attr('data-selectie');
                $('.' + class_).find("option").map(function() {
                    $(this).removeData();
                    return this;
                }).prop('selected', false);
            });

            $('input').on('keyup', function(e) {
                if (e.key === "Enter") {  // Only trigger on Enter key
                    if ($(this).val().length > 1) {
                        filter_lijst($(this));  // Call the filter_lijst function to filter the options
                    } else {
                        let selectie = $(this).data().select_class;
                        let selec_vals = $("." + selectie).find("option");  // Get options
                        selec_vals.map(function() {
                            $(this).removeData();
                            return this;
                        }).prop('selected', false);
                    }
                }
            });
        };

        return App;  // Return the App constructor
    });

});
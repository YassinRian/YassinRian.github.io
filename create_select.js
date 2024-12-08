define(['jquery'], function ($) {

    function create_select () {};

    create_select.prototype.draw = function(options) {
  
            var control = this;
            var data = options.data; // This contains the `cluster_naam` data

            // Create a select element
            var select = $('<select>', {
                id: options.controlId, // Unique ID for the select element
                class: 'custom-select'
            });

            // Populate the select element with options from the data
            if (data && data.length > 0) {
                data.forEach(function (item) {
                    // `item.use` holds the actual value, `item.display` the label
                    select.append($('<option>', {
                        value: item.use,
                        text: item.display
                    }));
                });
            } else {
                select.append($('<option>', {
                    value: '',
                    text: 'No Data Available'
                }));
            }

            // Append the select element to the control container
            $('#' + options.controlId).append(select);

            // Monitor changes and set values in Cognos
            select.on('change', function () {
                var selectedValue = $(this).val();
                control.setValues([{ use: selectedValue, display: selectedValue }]);
            });
        }
});

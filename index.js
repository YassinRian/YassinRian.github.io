define(['jquery', 'https://yassinrian.github.io/html_func.js'], function($, html_func_) {

    "use strict";

    class App
    {

        filter_lijst(_this_) {
            let inp_val = $.trim(_this_.val().replace(/\s+/g, '').toUpperCase());
            let selectie = _this_.data().select_class;
            let selec_vals = $("." + selectie).find("option");
        
            // Compile the input value into a regular expression
            let searchRegex = new RegExp(inp_val, 'i'); // 'i' for case-insensitive matching
        
            selec_vals.each(function () {
                let optionText = $(this).text().replace(/\u00A0/g, '');
                if (searchRegex.test(optionText)) {
                    $(this).data({ selected: true });
                } else {
                    $(this).data({ selected: false });
                }
            });
        
            selec_vals.filter(function(){
                return $(this).data().selected;
                }).show().prop('selected', true);
           
        }

       setData(oDataStore) {
         this.DataStore = oDataStore;
       }


        initialize( oControlHost, fnDoneInitializing )
        {
            fnDoneInitializing();
        }
         

        draw(oControlHost)
        {

            let _1wh = 'some_value_for_s1h';
            let _cvn = 'some_name';
            let _97n = 123
            let _psn = this.DataStore._x3c._9tg[0]; // dit werkt !! wow:)
            
            let obj_yassin = new _3a5(_1wh, _cvn, _97n, _psn);
            //this.data = obj_yassin.json.columns

            let elm = oControlHost.container;
           // $(elm).append(html_func_.html(obj_yassin));
           console.log(obj_yassin);

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
        }
    }

    return App;


}); 


 
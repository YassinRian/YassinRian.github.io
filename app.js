define(['jquery', 'https://yassinrian.github.io/html_func.js'], function($, html_func_){

function App(){}

function filter_lijst(_this_) {
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



App.prototype.setData = function(oDataStore) {
        this.DataStore = oDataStore;
    }


App.prototype.draw = function(oControlHost) {

    let _1wh = 'some_value_for_s1h'; //some dummy value -- wat deze waarden dienen te zijn weet ik niet
    let _cvn = 'some_name'; // dummy value
    let _97n = 123 // dummy value
    let _psn = this.DataStore._x3c._9tg[0]; // dit werkt !! wow:) -- dit is dat die meegegeven wordt om een instantie van _3a5 te kunnen maken 
    
    
    let obj_yassin = new _3a5(_1wh, _cvn, _97n, _psn); // nieuwe instantie van _3a5, dit is een object met handige functies

    let elm = oControlHost.container;
	$(elm).append(html_func_.html(obj_yassin.json.columns)); // voeg html aan component

// input velden referen naar een selectie box, hier wordt de link gelegd tussen input en selectie_box
$('#box1').data({ select_class: 'select_1' })
$('#box2').data({ select_class: 'select_2' })

// events
$('.wis_selecties').on('click', function(){
    // button heeft referentie naar een selectie box
    let class_ = $(this).attr('data-selectie');
    $('.' + class_).find("option").map(function() {
        $(this).removeData();
    return this
    }).prop('selected', false)
})


$('input').on('keyup', function (e) {
    if (e.key === "Enter") { // Only trigger on Enter key
        if ($(this).val().length > 1) {
            filter_lijst($(this));
        }
     else {
        let selectie = $(this).data().select_class;
        let selec_vals = $("." + selectie).find("option"); // dit geeft een array terug van options
        selec_vals.map(function(){
            $(this).removeData();
            return this
        }).prop('selected', false)
    }
}
});
				
}


return App;



});

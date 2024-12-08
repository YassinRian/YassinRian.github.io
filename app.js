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

/* function filter_lijst (_this_) {
    let inp_val = $.trim(_this_.val().replace(/\s+/g, '').toUpperCase());
    let selectie = _this_.data().select_class;
    let selec_vals = $("." + selectie).find("option");

    // Create a regexp based on the input value
    let searchRegex = new RegExp(inp_val, 'i'); // 'i' for case-insensitive matching

    // Directly filter, show, and select matching options
    selec_vals.filter(function () {
        let optionText = $(this).text().replace(/\u00A0/g, '');
        return searchRegex.test(optionText); // Match against the regexp
    }).prop('selected', true);
} */



App.prototype.initialize = function( oControlHost, fnDoneInitializing)
{
	
	let elm = oControlHost.container;
	$(elm).append(html_func_.html()); // voeg html aan component
	fnDoneInitializing();
	
};



App.prototype.draw = function(oControlHost) {

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

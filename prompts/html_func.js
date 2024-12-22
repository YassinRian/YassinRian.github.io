define(['jquery'],function ($) {
	return {
    filter_lijst: function (inputElement) {
      let inp_val = $.trim($(inputElement).val().replace(/\s+/g, "").toUpperCase());
      let selectie = $(inputElement).data().select_class;
      let selec_vals = $("." + selectie).find("option");
  
      // Compile the input value into a regular expression
      let searchRegex = new RegExp(inp_val, "i"); // 'i' for case-insensitive matching
  
      // Iterate over each option and set data attributes based on matching
      selec_vals.each(function () {
          let optionText = $(this).text().replace(/\u00A0/g, ""); // Clean up non-breaking spaces
          if (searchRegex.test(optionText)) {
              $(this).data({ selected: true });
          } else {
              $(this).data({ selected: false });
          }
      });
  
      // Filter the options based on the data attribute and update their state
      selec_vals
          .filter(function () {
              return $(this).data().selected; // Only include options marked as selected
          })
          .show() // Make them visible
          .prop("selected", true); // Select them
  },
  
    wis_selecties: function(element) {
      let class_ = $(element).attr("data-selectie");
      $("." + class_)
        .find("option")
        .map(function () {
          $(this).removeData();
          return this;
        })
        .prop("selected", false);
    },
    input_func: function(e, func) {
      let _this_ = $(e.target); // Get the input element
      if (e.key === "Enter") {
          if (_this_.val().length > 1) {
              func(_this_); // Call the filter_lijst function
          } else {
              let selec_vals = $("." + _this_.data().select_class).find("option");
              selec_vals
                  .map(function () {
                      $(this).removeData();
                      return this;
                  })
                  .prop("selected", false);
          }
      }
  },
		html: (data) => {
      console.log(data);
      // Find the datasets for keys and categories
      const keyData = data.find(d => d.name === 'CLUSTER_KEY');
      const categoryData = data.find(d => d.name === 'Cluster naam');
      
      // Generate options dynamically
      const options = keyData && categoryData
        ? keyData.values.map((key, index) => {
            const category = categoryData.values[index];
            return `<option value="${key}">${category}</option>`;
          }).join('') : '';
    
      // Return the HTML structure with dynamic options
  return `
    
    <style>
    .select_2 {
    width: 200px;
    height: 200px;
    }
    </style>
    
    <div class="cnt">
      <div class="prmt_container">
        <input id="box2" name="box2" type="text">
        <button class="wis_selecties" data-selectie="select_2">wis selecties</button>
        <div class="prmt_box box2">
          <h3>Box 2</h3>
          <select class="select_2" multiple>
            ${options}
          </select>
        </div>
      </div>
    </div>
      `
    }
	};
});

define(['jquery'],function ($) {
	return {
    filter_lijst: (_this_) => {
      let inp_val = $.trim(_this_.val().replace(/\s+/g, "").toUpperCase());
      let selectie = _this_.data().select_class;
      let selec_vals = $("." + selectie).find("option");

      // Compile the input value into a regular expression
      let searchRegex = new RegExp(inp_val, "i"); // 'i' for case-insensitive matching

      selec_vals.each(function (_this_) {
        let optionText = $(this).text().replace(/\u00A0/g, "");
        if (searchRegex.test(optionText)) {
          $(_this_).data({ selected: true });
        } else {
          $(_this_).data({ selected: false });
        }
      });

      selec_vals
        .filter(function (_this_) {
          return $(_this_).data().selected;
        })
        .show()
        .prop("selected", true);
    },
    wis_selecties: function(_this_) {
      let class_ = $(_this_).attr("data-selectie");
      $("." + class_)
        .find("option")
        .map(function () {
          $(_this_).removeData();
          return _this_;
        })
        .prop("selected", false);
    },
    input_func: function(_this_) {
      if (e.key === "Enter") {
        // Only trigger on Enter key
        if ($(_this_).val().length > 1) {
          this.filter_lijst($(_this_)); // Call the filter_lijst function to filter the options
        } else {
          let selectie = $(_this_).data().select_class;
          let selec_vals = $("." + selectie).find("option"); // Get options
          selec_vals
            .map(function () {
              $(_this_).removeData();
              return _this_;
            })
            .prop("selected", false);
        }
      }
    },
		html: (data) => {
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

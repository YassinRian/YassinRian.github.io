define(function () {
	return {
    filter_lijst: (_this_) => {
      let inp_val = $.trim(_this_.val().replace(/\s+/g, "").toUpperCase());
      let selectie = _this_.data().select_class;
      let selec_vals = $("." + selectie).find("option");

      // Compile the input value into a regular expression
      let searchRegex = new RegExp(inp_val, "i"); // 'i' for case-insensitive matching

      selec_vals.each(function () {
        let optionText = $(this).text().replace(/\u00A0/g, "");
        if (searchRegex.test(optionText)) {
          $(this).data({ selected: true });
        } else {
          $(this).data({ selected: false });
        }
      });

      selec_vals
        .filter(function () {
          return $(this).data().selected;
        })
        .show()
        .prop("selected", true);
    },
    wis_selecties: (e) => {
      let class_ = $(this).attr("data-selectie");
      $("." + class_)
        .find("option")
        .map(function () {
          $(this).removeData();
          return this;
        })
        .prop("selected", false);
    },
    input_func: (e) => {
      if (e.key === "Enter") {
        // Only trigger on Enter key
        if ($(this).val().length > 1) {
          this.filter_lijst($(this)); // Call the filter_lijst function to filter the options
        } else {
          let selectie = $(this).data().select_class;
          let selec_vals = $("." + selectie).find("option"); // Get options
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

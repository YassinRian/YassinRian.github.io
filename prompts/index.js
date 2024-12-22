define(["jquery", "https://yassinrian.github.io/prompts/html_func.js"], function ($,html_func_) {
  "use strict";

  class App {
    filter_lijst(_this_) {
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
    }

    setData(oDataStore) {
      this.data = oDataStore.control.dataStores[0].json;
    }

    draw(oControlHost) // deze plaats alles globaal
     {

      let elm = oControlHost.container;
      $(elm).append(html_func_.html(this.data.columns));

      $("#box1").data({ select_class: "select_1" });
      $("#box2").data({ select_class: "select_2" });

      // Set up event handlers
      $(".wis_selecties").on("click", function () {
        let class_ = $(this).attr("data-selectie");
        $("." + class_)
          .find("option")
          .map(function () {
            $(this).removeData();
            return this;
          })
          .prop("selected", false);
      });

      $("input").on("keyup", function (e) {
        if (e.key === "Enter") {
          // Only trigger on Enter key
          if ($(this).val().length > 1) {
            var ins_app = new App(); // nieuw instantie om filter_lijst aan te roepen
            ins_app.filter_lijst($(this)); // Call the filter_lijst function to filter the options
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
      });
    } // draw
  } // class

  return App;
});

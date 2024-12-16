define(function() {
    "use strict";

    return function() {
        return {
            draw: function(oControlHost)
            {
                let _1wh = 'some_value_for_s1h';
                let _cvn = 'some_name';
                let _97n = 123
                let _psn = this.DataStore._x3c._9tg[0]; // dit werkt !! wow:)
                
                let obj_yassin = new _3a5(_1wh, _cvn, _97n, _psn);
                this.data_control = obj_yassin.json.columns //dit werkt
                
            },
            setData: function(oDataStore) {
                this.DataStore = oDataStore;
            },
            getData: function() {
                return this.data_control;
            }

        }
    }
})




define(['jquery'], function($){
    
    function App() {};

    App.prototype.draw = function(oControlHost) {
        let _1wh = 'some_value_for_s1h';
        let _cvn = 'some_name';
        let _97n = 123
        let _psn = this.DataStore._x3c._9tg[0]; // dit werkt !! wow:)
        
        let obj_yassin = new _3a5(_1wh, _cvn, _97n, _psn);
        //this.data = obj_yassin.json.columns

        console.log(obj_yassin)
    }

    return App;
})
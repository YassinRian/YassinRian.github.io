define(function () {
    "use strict"

    function BasicControl() { };

    BasicControl.prototype.draw = function(oControlHost){
        // let _1wh = 'some_value_for_s1h';
        // let _cvn = 'some_name';
        // let _97n = 123
        // let _psn = {
        //     columns: [
        //         {name: 'Column1', values: [1, 2, 3], formattedValues: ['1', '2', '3'], dataType: 'decimal'},
        //         {name: 'Column2', values: [4, 5, 6], formattedValues: ['4', '5', '6'], dataType: 'string'}
        //     ],
        //     rows: [0, 1, 2]
        // };
        // let obj_yassin = new _3a5(_1wh, _cvn, _97n, _psn);
        // console.log(obj_yassin.name);
        // console.log(obj_yassin.rowCount);
        // console.log(obj_yassin.columnNames);
        console.log(oControlHost.page.getControlByName("List1"))
    }

    return BasicControl;
})
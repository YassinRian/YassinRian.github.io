define(function() {
    return {
        selectBox: () => {
            return `
            <div>
            <label for="select_parse_type">Select Type:</label>
            <select id="select_parse_type">
                <option value="Queries">Queries</option>
                <option value="Lists">Lists</option>
                <option value="Detail Filters">Detail Filters</option>
            </select>
            <button id="button_parse">Parse</button>
            `;
        },      
        modal: () => {
            return `
            <div id="table_modal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(222, 222, 222, 0.5); z-index: 1000;">
                <div class="modal-content" draggable="true">                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="close-modal" style="font-size: 24px; cursor: pointer; color: #666;">&times;</span>
                    </div>
        
                    <div id="table_container"></div>
                </div>
            </div>
            `
        }
    }

});

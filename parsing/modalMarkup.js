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
            <div id="table_modal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 1000;">
                <div class="modal-content" style="
                    position: relative; 
                    background-color: #fff; 
                    margin: 15vh auto;  /* 15% from top */
                    padding: 20px; 
                    width: 80%; 
                    max-width: 1000px; 
                    border-radius: 5px; 
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    height: 70vh;      /* 70% of viewport height (leaving 15% top and bottom) */
                    overflow-y: auto;   /* Enable vertical scrolling */
                ">
                    <span class="close-modal" style="position: absolute; right: 10px; top: 10px; font-size: 24px; cursor: pointer; color: #666; z-index: 1001;">&times;</span>
                    <div id="table_container"></div>
                </div>
            </div>
            `
        }
    }

});

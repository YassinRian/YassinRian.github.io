define(function() {
    return `
        <div>
            <label for="select_parse_type">Select Type:</label>
            <select id="select_parse_type">
                <option value="Queries">Queries</option>
                <option value="Lists">Lists</option>
                <option value="Detail Filters">Detail Filters</option>
            </select>
            <button id="button_parse">Parse</button>
        </div>
        <div id="table_modal" style="display: none;">
            <div class="modal-content minimized">
                <div id="table_container"></div>
            </div>
        </div>

        <div id="table_modal" class="modal">
            <div class="modal-content">
                <div style="position: absolute; right: 10px; top: 10px; z-index: 1001;">
                    <span class="minimize-modal">─</span>
                    <span class="close-modal">&times;</span>
                </div>
                <div id="table_container"></div>
            </div>
        </div>
    `;
});

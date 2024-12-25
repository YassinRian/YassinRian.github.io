define(function () {
  return {
    selectBox: () => {
      return `
  <div class="control-group">
          <label for="select_parse_type">Select Type</label>
          <select id="select_parse_type">
            <option value="Queries">Queries</option>
            <option value="Lists">Lists</option>
            <option value="Filters">Detail Filters</option>
          </select>
          <button id="button_parse" class="parse-button">Parse</button>
          <div class="divider"></div>
          <button id="xmlExportBtn" class="export-button">
            <span class="export-icon">📤</span>
            Export Sorted XML
          </button>
        </div>
            `;
    },
    modal: () => {
      return `
            <div id="table_modal" class="modal">
                <div class="modal-content" draggable="true">                    
                    <div style="display: flex; justify-content: right; align-items: center;">
                        <span class="close-modal" style="font-size: 28px; cursor: pointer; color:rgb(40, 43, 40);">&times;</span>
                    </div>
        
                    <div id="table_container"></div>
                </div>
            </div>
            `;
    },
    // Add search input
    searchInput: () => {
      return `
        <div class="search-container">
            <input id="searchInput" type="text" placeholder="Enter search terms column-by-column using '::' (e.g., 'term1::term2::term3')" />
            <label class="checkbox-container">
                <input type="checkbox" id="regexToggle" />
                Use Regular Expression
            </label>
        </div>
        `;
    },
  };
});

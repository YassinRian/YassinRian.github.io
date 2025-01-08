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
          <button id="button_parse" class="parse-button">Overzicht velden</button>
          <div class="divider"></div>
          <button id="xmlExportBtn" class="export-button">
            <span class="export-icon">📤</span>
            Sorteer velden in Queries
          </button>
        </div>
            `;
    }
  };
});

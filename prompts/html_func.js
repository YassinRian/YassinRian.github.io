define(function () {
	return {
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

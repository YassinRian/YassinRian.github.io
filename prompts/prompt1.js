define([
  "jquery"
], function ($) {
  "use strict";

  class App {
    constructor() {}

    draw(oControlHost) {
      let promptElement = oControlHost.page.getControlByName("prmt_clusters").element; // this is the select element
      let container = oControlHost.container; // this is the div container
      
      // First remove the first two options from the original select if needed
      if (promptElement && promptElement.options && promptElement.options.length >= 2) {
        promptElement.remove(0);
        promptElement.remove(0);
      }
      
      // Create a container for our custom dropdown
      const customDropdownContainer = document.createElement('div');
      customDropdownContainer.className = 'custom-select-container';
      customDropdownContainer.style.position = 'relative';
      customDropdownContainer.style.width = '100%';
      customDropdownContainer.style.marginBottom = '10px';
      
      // Create search input
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.className = 'select-search';
      searchInput.placeholder = 'Search options...';
      searchInput.style.width = '100%';
      searchInput.style.padding = '8px';
      searchInput.style.border = '1px solid #ccc';
      searchInput.style.borderRadius = '4px';
      
      // Create dropdown list
      const dropdownList = document.createElement('div');
      dropdownList.className = 'select-dropdown';
      dropdownList.style.display = 'none';
      dropdownList.style.position = 'absolute';
      dropdownList.style.zIndex = '1000';
      dropdownList.style.width = '100%';
      dropdownList.style.maxHeight = '200px';
      dropdownList.style.overflowY = 'auto';
      dropdownList.style.backgroundColor = 'white';
      dropdownList.style.border = '1px solid #ddd';
      dropdownList.style.borderTop = 'none';
      dropdownList.style.borderRadius = '0 0 4px 4px';
      dropdownList.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
      
      // Add elements to the custom container
      customDropdownContainer.appendChild(searchInput);
      customDropdownContainer.appendChild(dropdownList);
      
      // Append to oControlHost.container
      container.appendChild(customDropdownContainer);
      
      // Store the original select element's options
      const originalOptions = Array.from(promptElement.options);
      
      // Populate dropdown with options from select
      this.populateDropdown(dropdownList, promptElement, '', originalOptions);
      
      // Set initial input value if an option is selected
      if (promptElement.selectedIndex > -1) {
        searchInput.value = promptElement.options[promptElement.selectedIndex].text;
      }
      
      // Event handlers
      searchInput.addEventListener('focus', () => {
        dropdownList.style.display = 'block';
      });
      
      searchInput.addEventListener('blur', () => {
        // Delay hiding to allow for option clicking
        setTimeout(() => {
          dropdownList.style.display = 'none';
        }, 200);
      });
      
      searchInput.addEventListener('input', () => {
        this.populateDropdown(dropdownList, promptElement, searchInput.value, originalOptions);
      });
    }
    
    populateDropdown(dropdownList, selectElement, searchText, options) {
      // Clear current options
      dropdownList.innerHTML = '';
      
      // Filter options based on search text
      const filteredOptions = options.filter(option => 
        option.text.toLowerCase().includes(searchText.toLowerCase())
      );
      
      // Add filtered options to dropdown
      filteredOptions.forEach(option => {
        const item = document.createElement('div');
        item.className = 'select-item';
        item.textContent = option.text;
        item.style.padding = '8px';
        item.style.cursor = 'pointer';
        item.setAttribute('data-value', option.value);
        
        // Highlight selected option
        if (option.selected) {
          item.style.backgroundColor = '#f0f0f0';
          item.style.fontWeight = 'bold';
        }
        
        item.addEventListener('mouseover', () => {
          item.style.backgroundColor = '#f8f8f8';
        });
        
        item.addEventListener('mouseout', () => {
          if (!option.selected) {
            item.style.backgroundColor = 'transparent';
          } else {
            item.style.backgroundColor = '#f0f0f0';
          }
        });
        
        item.addEventListener('click', () => {
          // Update original select
          selectElement.value = option.value;
          
          // Trigger change event on select
          const event = new Event('change', { bubbles: true });
          selectElement.dispatchEvent(event);
          
          // Update input value
          const input = dropdownList.previousSibling;
          input.value = option.text;
          
          // Close dropdown
          dropdownList.style.display = 'none';
          
          // Update highlight
          Array.from(dropdownList.children).forEach(child => {
            child.style.backgroundColor = 'transparent';
            child.style.fontWeight = 'normal';
          });
          item.style.backgroundColor = '#f0f0f0';
          item.style.fontWeight = 'bold';
        });
        
        dropdownList.appendChild(item);
      });
      
      // If no results found
      if (filteredOptions.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'select-no-results';
        noResults.textContent = 'No matching options';
        noResults.style.padding = '8px';
        noResults.style.color = '#999';
        noResults.style.fontStyle = 'italic';
        dropdownList.appendChild(noResults);
      }
    }
  }

  return App;
});
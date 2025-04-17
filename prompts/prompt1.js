define([
  "jquery"
], function ($) {
  "use strict";

  class App {
    constructor() {
      this.promptElement = null;
    }

    initialize(oControlHost, fnDoneInitializing) {
      try {
        const control = oControlHost.page.getControlByName("prmt_clusters");
        if (!control) {
          console.error("Control 'prmt_clusters' not found");
          this.promptElement = null;
        } else {
          this.promptElement = control.element;
          
          // Check if this.promptElement is a select element or contains one
          if (this.promptElement) {
            if (this.promptElement.tagName !== 'SELECT') {
              // Try to find a select element inside
              const selectEl = this.promptElement.querySelector('select');
              if (selectEl) {
                this.promptElement = selectEl;
              } else {
                console.error("No SELECT element found within control");
              }
            }
          } else {
            console.error("Control element is null or undefined");
          }
        }
        
        this.container = oControlHost.container;
      } catch (error) {
        console.error("Error during initialization:", error);
        this.promptElement = null;
      }
      
      fnDoneInitializing();
    }

    draw(oControlHost) {
      // Make sure we have the prompt element and it has options
      if (!this.promptElement) {
        console.error("Prompt element was not initialized properly");
        return;
      }
      
      if (!this.promptElement.options) {
        console.error("Prompt element does not have options property. Element:", this.promptElement);
        return;
      }
      
      // Remove first two options if needed
      if (this.promptElement.options.length >= 2) {
        this.promptElement.remove(0);
        this.promptElement.remove(0);
      }
      
      // Store the original select element's options safely
      let originalOptions = [];
      try {
        originalOptions = Array.from(this.promptElement.options || []);
      } catch (error) {
        console.error("Error converting options to array:", error);
        originalOptions = [];
        
        // Fallback: try to manually extract options
        if (this.promptElement.options) {
          for (let i = 0; i < this.promptElement.options.length; i++) {
            originalOptions.push(this.promptElement.options[i]);
          }
        }
      }
      
      if (originalOptions.length === 0) {
        console.warn("No options found in the select element");
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
      
      // Append to container
      this.container.appendChild(customDropdownContainer);
      
      // Populate dropdown with options from select
      this.populateDropdown(dropdownList, this.promptElement, '', originalOptions);
      
      // Set initial input value if an option is selected
      if (this.promptElement.selectedIndex > -1 && this.promptElement.options.length > 0) {
        searchInput.value = this.promptElement.options[this.promptElement.selectedIndex].text;
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
        this.populateDropdown(dropdownList, this.promptElement, searchInput.value, originalOptions);
      });
    }
    
    populateDropdown(dropdownList, selectElement, searchText, options) {
      // Clear current options
      dropdownList.innerHTML = '';
      
      if (!options || options.length === 0) {
        const noOptions = document.createElement('div');
        noOptions.className = 'select-no-options';
        noOptions.textContent = 'No options available';
        noOptions.style.padding = '8px';
        noOptions.style.color = '#999';
        noOptions.style.fontStyle = 'italic';
        dropdownList.appendChild(noOptions);
        return;
      }
      
      // Filter options based on search text
      const filteredOptions = options.filter(option => 
        option && option.text && option.text.toLowerCase().includes(searchText.toLowerCase())
      );
      
      // Add filtered options to dropdown
      filteredOptions.forEach(option => {
        const item = document.createElement('div');
        item.className = 'select-item';
        item.textContent = option.text || '';
        item.style.padding = '8px';
        item.style.cursor = 'pointer';
        
        if (option.value) {
          item.setAttribute('data-value', option.value);
        }
        
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
          // Update original select (safely)
          if (selectElement && selectElement.value !== undefined) {
            selectElement.value = option.value;
            
            // Trigger change event on select
            try {
              const event = new Event('change', { bubbles: true });
              selectElement.dispatchEvent(event);
            } catch (error) {
              console.error("Error dispatching change event:", error);
            }
          }
          
          // Update input value
          const input = dropdownList.previousSibling;
          if (input) {
            input.value = option.text || '';
          }
          
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
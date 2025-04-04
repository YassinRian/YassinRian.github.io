define([], function() {
    /**
     * CSVUtility - A class for handling CSV operations with custom separators
     * 
     * Features:
     * - Custom separators to handle data containing commas
     * - Proper escaping of values containing separators or quotes
     * - UTF-8 BOM for Excel compatibility
     * - File downloading with proper timestamp formatting
     */
    class CSVUtility {
      constructor(options = {}) {
        // Default separator - can be changed as needed
        this.separator = options.separator || "::";
        this.quoteAll = options.quoteAll || false;
      }
  
      /**
       * Process complex data structure into a flat array of objects
       * 
       * @param {Array|Object} data - The data to process
       * @returns {Array} An array of flattened row objects
       */
      processData(data) {
        // Ensure data is an array
        if (!Array.isArray(data)) {
          data = [data];
        }
  
        // Process each query and its items
        const processedRows = [];
  
        data.forEach((query) => {
          // Skip if no items array
          if (!query.items || !Array.isArray(query.items)) return;
  
          // Process each item in the query
          query.items.forEach((item) => {
            if (!item) return;
  
            processedRows.push({
              "Query Name": query.name || "",
              "Item Name": item.name || "",
              Expression: (item.attributes && item.attributes.expression) || "",
              Label: (item.attributes && item.attributes.label) || "",
            });
          });
        });
  
        return processedRows;
      }
  
      /**
       * Convert processed data to CSV string with custom separator
       * 
       * @param {Array|Object} data - The data to convert
       * @param {String} customSeparator - Optional custom separator to override the default
       * @returns {String} CSV formatted string
       */
      convertToCSV(data, customSeparator) {
        // Use provided separator or default
        const separator = customSeparator || this.separator;
        
        // First process the data into the correct format
        const processedData = this.processData(data);
  
        if (!processedData.length) return "";
  
        // Define headers
        const headers = ["Query Name", "Item Name", "Expression", "Label"];
        const csvRows = [];
  
        // Add headers
        csvRows.push(headers.join(separator));
  
        // Add data rows
        processedData.forEach((row) => {
          const values = headers.map((header) => {
            let value = row[header] ?? "";
  
            // Convert to string and trim
            const stringValue = String(value).trim();
  
            // Force quotes for all values if quoteAll is true
            const needsQuotes = this.quoteAll || 
                               stringValue.includes(separator) || 
                               stringValue.includes('"') || 
                               stringValue.includes("\n");
            
            // Escape quotes and wrap in quotes if needed
            return needsQuotes
              ? `"${stringValue.replace(/"/g, '""')}"`
              : stringValue;
          });
          csvRows.push(values.join(separator));
        });
  
        return csvRows.join("\n");
      }
  
      /**
       * Download CSV content as a file
       * 
       * @param {String} csvContent - The CSV content to download
       * @param {String} filename - The filename to use
       * @param {String} customSeparator - Optional custom separator
       */
      downloadCSV(csvContent, filename, customSeparator) {
        // Use provided separator or default
        const separator = customSeparator || this.separator;
        
        // Set MIME type and file extension
        const mimeType = "text/csv;charset=utf-8;";
        
        // Determine file extension based on separator
        const fileExtension = separator === "," ? ".csv" : ".csv";
        
        // Ensure the filename has the correct extension
        const finalFilename = filename.endsWith(fileExtension) ? 
          filename : 
          filename.endsWith(".csv") ? 
            filename : 
            filename + fileExtension;
        
        // Add UTF-8 BOM for Excel compatibility
        const BOM = "\uFEFF";
        const contentWithBOM = BOM + csvContent;
        
        // Create and trigger download
        const blob = new Blob([contentWithBOM], { type: mimeType });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
  
        link.setAttribute("href", url);
        link.setAttribute("download", finalFilename);
        link.style.visibility = "hidden";
  
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
      }
  
      /**
       * Export data to CSV file with timestamp
       * 
       * @param {Array|Object} data - The data to export
       * @param {String} type - Type prefix for filename
       * @param {String} customSeparator - Optional custom separator
       * @returns {Boolean} Success status
       */
      exportToCSV(data, type, customSeparator) {
        try {
          // Use the custom separator or the default one
          const separator = customSeparator || this.separator;
          
          // Generate CSV content with the specified separator
          const csvContent = this.convertToCSV(data, separator);
          
          // Create filename with timestamp
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          const filename = `${type}_export_${timestamp}.csv`;
  
          // Download the file with the custom separator
          this.downloadCSV(csvContent, filename, separator);
          
          return true;
        } catch (error) {
          console.error("Error exporting to CSV:", error);
          alert("An error occurred while exporting to CSV. Please try again.");
          return false;
        }
      }
  
      /**
       * Parse CSV string back into array of objects
       * 
       * @param {String} csvString - The CSV string to parse
       * @param {String} customSeparator - Optional custom separator
       * @returns {Array} Array of objects representing the CSV data
       */
      parseCSV(csvString, customSeparator) {
        const separator = customSeparator || this.separator;
        const rows = csvString.split(/\r?\n/);
        const result = [];
        
        if (rows.length === 0) return result;
        
        // Get headers from first row
        const headers = this._parseLine(rows[0], separator);
        
        // Process data rows
        for (let i = 1; i < rows.length; i++) {
          if (rows[i].trim() === '') continue;
          
          const values = this._parseLine(rows[i], separator);
          const row = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          result.push(row);
        }
        
        return result;
      }
      
      /**
       * Parse a single CSV line considering quoted values
       * 
       * @private
       * @param {String} line - The line to parse
       * @param {String} separator - The separator to use
       * @returns {Array} Array of field values
       */
      _parseLine(line, separator) {
        const result = [];
        let inQuotes = false;
        let currentValue = '';
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            if (i + 1 < line.length && line[i + 1] === '"') {
              // Handle escaped quotes
              currentValue += '"';
              i++;
            } else {
              // Toggle quote state
              inQuotes = !inQuotes;
            }
          } else if (!inQuotes && 
                    i + separator.length <= line.length && 
                    line.substring(i, i + separator.length) === separator) {
            // Found a separator outside quotes
            result.push(currentValue);
            currentValue = '';
            i += separator.length - 1;
          } else {
            currentValue += char;
          }
        }
        
        // Add the last value
        result.push(currentValue);
        
        return result;
      }
    }
  
    return new CSVUtility();
  });
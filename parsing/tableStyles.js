define([], function () {
  const styles = `

       .table-container {
            width: 80%;
            margin: 20px auto;
            overflow-x: auto;
            background: white;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                       0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          /* Ensure smooth scrolling on mobile */
          .table-container::-webkit-scrollbar {
            height: 8px;
          }

          .table-container::-webkit-scrollbar-track {
            background: #f7fafc;
            border-radius: 4px;
          }

          .table-container::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 4px;
          }

          .table-container::-webkit-scrollbar-thumb:hover {
            background: #cbd5e0;
          }

          #dataTable {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-family: -apple-system, BlinkMacSystemFont, Arial,"Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;
            font-size: 14px;
            color: #2c3e50;
            text-align: left;
          }

          #dataTable thead {
            background-color: #f8fafc;
            position: sticky;
            top: 0;
            z-index: 10;
          }

          #dataTable thead th {
            padding: 14px 16px;
            border-bottom: 2px solid #e2e8f0;
            font-weight: 600;
            color: #4a5568;
            white-space: nowrap;
            background: inherit; /* Ensures sticky header maintains background */
          }

          #dataTable tbody tr {
            border-bottom: 1px solid #edf2f7;
            transition: background-color 0.15s ease;
          }

          #dataTable tbody tr:nth-child(even) {
            background-color: #fafafa;
          }

          #dataTable tbody td {
            padding: 12px 16px;
            line-height: 1.4;
            vertical-align: middle;
          }

          #dataTable tbody tr:hover {
            background-color: #f7fafc;
          }

          /* Make last row's bottom border match container */
          #dataTable tbody tr:last-child {
            border-bottom: none;
          }

          /* Header styles */
          .table-header {
            position: relative;
            transition: background-color 0.2s ease;
            user-select: none;
          }

          .table-header.selected,
          .table-header.selected .header-content {
            background-color: #ebf5ff !important;
          }
          
          /* Ensure the selected state is visible */
          .table-header {
            background-color: transparent;
          }
          
          .table-header .header-content {
            background-color: inherit;
            height: 100%;
            width: 100%;
          }

          .header-content {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .sort-icon {
            margin-left: auto;
            cursor: pointer;
            opacity: 0.5;
            font-size: 0.85em;
            transition: opacity 0.15s ease;
          }

          .sort-icon:hover {
            opacity: 0.9;
          }

          .analysis-icon {
            cursor: help;
            opacity: 0.5;
            font-size: 0.85em;
            transition: opacity 0.15s ease;
          }

          .analysis-icon:hover {
            opacity: 0.9;
          }

          /* Expression cell styles */
          .expression-cell {
            position: relative;
            max-width: 300px; /* Prevent cells from getting too wide */
          }

          .expression-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
          }

          .expression-text {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .copy-icon {
            opacity: 0;
            transition: opacity 0.15s ease;
            font-size: 0.85em;
            color: #718096;
            padding: 4px;
            border-radius: 4px;
            cursor: pointer;
            flex-shrink: 0;
          }

          .expression-cell:hover .copy-icon {
            opacity: 0.5;
          }

          .copy-icon:hover {
            opacity: 1 !important;
            background-color: #f7fafc;
          }

          /* Search input styles */
          #searchInput {
            width: calc(100% - 24px);
            padding: 8px 12px;
            margin: 12px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.15s ease;
          }

          #searchInput:focus {
            outline: none;
            border-color: #90cdf4;
            box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
          }



/* Other styles */
          
          /* Popup styles */
          .column-popup {
            background-color: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 1000;
            max-width: 400px;
            max-height: 400px;
            overflow-y: auto;
          }
          .column-popup table {
            width: 100%;
            border-collapse: collapse;
          }
          .column-popup th, .column-popup td {
            padding: 5px;
            border: 1px solid #ddd;
          }
          .column-popup th {
            background-color: #f5f5f5;
          }

/* parse button styles */

 .control-group {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 6px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }

      .control-group label {
        font-weight: 500;
        color: #495057;
        min-width: 85px;
      }

      .control-group select {
        padding: 8px 12px;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        background-color: white;
        color: #495057;
        font-size: 14px;
        min-width: 150px;
        cursor: pointer;
        transition: all 0.2s;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23495057' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;
        padding-right: 32px;
      }

      .control-group select:hover {
        border-color: #adb5bd;
      }

      .control-group select:focus {
        outline: none;
        border-color: #80bdff;
        box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
      }

      .control-group button {
        padding: 8px 16px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .control-group button:hover {
        background-color: #0056b3;
      }

      .control-group button:active {
        background-color: #004085;
      }

      .control-group .parse-button::before {
        content: "⚡";
        font-size: 14px;
      }

      .control-group .divider {
        width: 1px;
        height: 24px;
        background-color: #dee2e6;
        margin: 0 8px;
      }

      @media (max-width: 768px) {
        .control-group {
          flex-direction: column;
          align-items: stretch;
          gap: 8px;
        }
        
        .control-group label {
          min-width: auto;
        }
        
        .control-group select {
          width: 100%;
        }
        
        .control-group button {
          width: 100%;
          justify-content: center;
        }

        .control-group .divider {
          width: 100%;
          height: 1px;
          margin: 8px 0;
        }
      }



`;

  // Dynamically inject CSS into the document

  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
  console.log("Table styles injected!");
});

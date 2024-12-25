define([], function () {
  const styles = `
        .table-container {
            width: 80%;
            margin: 20px auto;
            overflow-x: auto;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            border: 1px solid #ddd;
        }

        #dataTable {
            width: 100%;
            border-collapse: collapse;
            font-family: Arial, sans-serif;
            font-size: 16px;
            color: #333;
            text-align: left;
        }

        #dataTable thead {
            background-color: #f4f4f4;
            color: #555;
            font-weight: bold;
        }

        #dataTable thead th {
            padding: 12px 15px;
            border-bottom: 2px solid #ddd;
        }

        #dataTable tbody tr {
            border-bottom: 1px solid #ddd;
        }

        #dataTable tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        #dataTable tbody td {
            padding: 12px 15px;
        }

        #dataTable tbody tr:hover {
            background-color: #f1f1f1;
        }

/* Modal Styling */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    overflow: visible; /* Ensure child resizing works */
}

.modal-content {
    position: absolute;
    background-color: #fff;
    padding: 20px;
    resize: both; /* Enable horizontal and vertical resizing */
    overflow: auto;
    width: 80%;
    max-width: calc(100% - 20px); /* Prevent resizing beyond parent width */
    min-width: 300px;
    height: 70vh;
    max-height: calc(100% - 20px); /* Prevent resizing beyond parent height */
    min-height: 200px;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    top: 15%;
    left: 10%;
    box-sizing: border-box; /* Ensure padding doesn't interfere */
}

/* Resizable Handle (optional for better UI) */
.modal-content::after {
    content: "";
    width: 15px;
    height: 15px;
    background: rgba(0, 0, 0, 0.2);
    position: absolute;
    bottom: 5px;
    right: 5px;
    cursor: se-resize;
    z-index: 10;
    border-radius: 2px;
}

/* Close Button */
.modal-content > .close-modal {
    cursor: pointer;
    color: #666;
    font-size: 24px;
}

/* Body Interaction During Modal */
body.modal-active {
    overflow: hidden; /* Prevent scrolling */
}

/* Search Container */
.search-container {
    display: flex;
    align-items: center;
    gap: 10px; /* Space between elements */
    margin-bottom: 15px; /* Add some spacing below the input */
    padding: 10px;
    background-color: #f9f9f9; /* Light background for input container */
    border: 1px solid #ddd; /* Border for the container */
    border-radius: 8px; /* Rounded corners */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow */
}

/* Search Input */
#searchInput {
    flex: 1; /* Make input take up available space */
    padding: 10px 15px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 5px;
    outline: none;
    transition: all 0.3s ease;
}

/* Focus State for Input */
#searchInput:focus {
    border-color: #007bff; /* Blue border on focus */
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); /* Glow effect */
}

/* Checkbox Container */
.checkbox-container {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #555;
}

/* Checkbox */
#regexToggle {
    margin-right: 5px; /* Space between checkbox and label */
}

/* Table Styles */
      /* Header styles */
          .table-header {
            position: relative;
            transition: background-color 0.2s;
            user-select: none;
          }
          .table-header.selected {
            background-color: #e6f3ff;
          }
          .header-content {
            display: flex;
            align-items: center;
            padding: 8px;
          }
          .sort-icon {
            margin-left: auto;
            cursor: pointer;
            opacity: 0.6;
          }
          .sort-icon:hover {
            opacity: 1;
          }
          .analysis-icon {
            cursor: help;
            opacity: 0.6;
            margin-right: 10px;
          }
          .analysis-icon:hover {
            opacity: 1;
          }
          
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

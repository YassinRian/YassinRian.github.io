define([], function () {
  const styles = `

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
        background-color:rgb(6, 99, 198);
      }

      .control-group button:active {
        background-color:rgb(1, 76, 155);
      }

      .control-group .parse-button::before {
        font-family: "Material Icons";
        content: "summarize";
        font-size: 14px;
      }
      .control-group .xmlExportBtn::before {
        font-family: "Material Icons";
        content: "system_update_alt";
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


  // Create a new link element
  const link = document.createElement("link");

  // Set the attributes for the link
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
  
  // Append the link to the <head> of the document
  document.head.appendChild(link);



  // Dynamically inject CSS into the document

  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
  console.log("Table styles injected!");


});

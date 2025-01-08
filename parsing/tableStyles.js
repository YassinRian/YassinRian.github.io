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
        background-color: #0056b3;
      }

      .control-group button:active {
        background-color: #004085;
      }

      .control-group .parse-button::before {
        content: "<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M320-600q17 0 28.5-11.5T360-640q0-17-11.5-28.5T320-680q-17 0-28.5 11.5T280-640q0 17 11.5 28.5T320-600Zm0 160q17 0 28.5-11.5T360-480q0-17-11.5-28.5T320-520q-17 0-28.5 11.5T280-480q0 17 11.5 28.5T320-440Zm0 160q17 0 28.5-11.5T360-320q0-17-11.5-28.5T320-360q-17 0-28.5 11.5T280-320q0 17 11.5 28.5T320-280ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h440l200 200v440q0 33-23.5 56.5T760-120H200Zm0-80h560v-400H600v-160H200v560Zm0-560v160-160 560-560Z"/></svg>";
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

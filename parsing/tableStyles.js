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

`;

  // Dynamically inject CSS into the document

  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
  console.log("Table styles injected!");
});

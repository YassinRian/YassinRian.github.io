define([], function() {

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

.modal-content.minimized {
    height: 40px !important;
    overflow: hidden !important;
    padding-top: 10px !important;
    padding-bottom: 10px !important;
}

.minimize-modal.minimized {
    transform: rotate(180deg);
}

/* Additional modal styling (you can keep or modify this as per your need) */
.modal-content {
    position: relative;
    background-color: #fff;
    margin: 15vh auto;
    padding: 20px;
    width: 80%;
    max-width: 1000px;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    height: 70vh;
    overflow-y: auto;
    transition: all 0.3s ease;
}

.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    z-index: 1000;
}

.modal-content > .minimize-modal {
    cursor: pointer;
    color: #666;
    font-size: 24px;
    margin-right: 15px;
}

.modal-content > .close-modal {
    cursor: pointer;
    color: #666;
    font-size: 24px;
}

    `;

 

    // Dynamically inject CSS into the document

    const styleSheet = document.createElement('style');

    styleSheet.type = 'text/css';

    styleSheet.innerText = styles;

    document.head.appendChild(styleSheet);

 

    console.log('Table styles injected!');

});

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

    `;

 

    // Dynamically inject CSS into the document

    const styleSheet = document.createElement('style');

    styleSheet.type = 'text/css';

    styleSheet.innerText = styles;

    document.head.appendChild(styleSheet);

 

    console.log('Table styles injected!');

});

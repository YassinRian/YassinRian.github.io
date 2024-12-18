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

        table {

            width: 100%;

            border-collapse: collapse;

            font-family: Arial, sans-serif;

            font-size: 16px;

            color: #333;

            text-align: left;

        }

        thead {

            background-color: #f4f4f4;

            color: #555;

            font-weight: bold;

        }

        thead th {

            padding: 12px 15px;

            border-bottom: 2px solid #ddd;

        }

        tbody tr {

            border-bottom: 1px solid #ddd;

        }

        tbody tr:nth-child(even) {

            background-color: #f9f9f9;

        }

        tbody td {

            padding: 12px 15px;

        }

        tbody tr:hover {

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

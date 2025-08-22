export const imsWrapperReportContent = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
        integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
    <title>Reporte Checadas IMSS BIENESTAR</title>
    <style>
        .page-break {
            page-break-before: always;
            background-color: red;
        }

        thead {
            display: table-header-group !important;
        }

        tr {
            page-break-inside: avoid !important;
            text-align: center;
            font-size: 11px;
        }

        p {
            font-size: 15px;
            margin-bottom: -1px;
            font-weight: 600;
        }

        .subtitle {
            font-weight: 500;
        }

        .row {
            margin-bottom: 15px;
        }

        .paramsBox {
            border-bottom: 1px solid black;
            width: 200px;
        }

        span {
            display: block;
            font-size: 14px;
            margin-bottom: 5px;
        }

        .linedata {
            display: block;
            font-size: 14px;
            margin-bottom: 0px;
        }

        .description {
            font-size: 10.5px;
        }

        .footerTitle {
            font-weight: bold;
        }

        .signBox {
            width: 85%;
            margin-top: 30px;
            border-top: 1px solid black;
            display: flex;
            justify-content: center;
        }
    </style>
</head>

<body style="display: flex; flex-direction: column; min-height: 100vh;">
  {all_content}
</body>

</html>
`;
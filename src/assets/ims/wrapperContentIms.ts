export const imsWrapperReportContent = `
<html>

<head>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">
  <meta charset="UTF-8">
  <title>Reporte Ims</title>

  <style>
    .page-break {
      page-break-before: always;
      background-color: red;
    }

    thead { 
      display: table-header-group !important; 
  }

  /* Garantiza que las filas de la tabla no se corten */
  tr {
      page-break-inside: avoid !important;
  }

  </style>
</head>

<body>
  {all_content} 
</body>


</html> 
`;
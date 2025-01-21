export const imsReportMainContent = `

<div style="position: relative; min-height: 100%; width: 100%; page-break-before: always;">

<header class="d-flex justify-content-between container-lg">
    <div id="main-log" class="d-flex align-items-center">
        <img src="https://vectorlogoseek.com/wp-content/uploads/2019/08/gobierno-de-mexico-vector-logo.png"
            alt="IMS" class="img-fluid" style="width: 200px;" />


        <div style="text-align: center; margin-left: 15px;">
            <span style="text-decoration: underline;">SERVICIOS DE SALUD</span>
            <br>
            <span style="font-weight: bold;">IMSS-BIENESTAR</span>
        </div>

    </div>

    <div id="legend" class="d-flex align-items-center" style="font-size: 10px;">
        DIRECCIÓN GENERAL
        <br>
        UNIDAD DE ADMINISTRACIÓN Y FINANZAS
        <br>
        COORDINACIÓN DE RECURSOS HUMANOS
    </div>
</header>

<main class="container-fluid" style="position: relative;">
    <div id="tile" style="font-weight: bold;    top: -12px; position: relative;"
        class="d-flex align-items-center justify-content-center">
        REGISTRO DE ASISTENCIA
    </div>
    <div class="container-lg d-flex justify-content-end pb-5">

        <div>
            <span class="ml-4" style="margin-right: 10px;">
                MES:
            </span>

            <span style="text-decoration: underline;">
                {quince}
            </span>
        </div>
    </div>

    <div class="table d-flex justify-content-between container-sm">
        <table>
            <thead>
                <tr style="border-bottom: none !important;">
                    <td>NOMBRE:</td>
                    <td style="border-bottom: 1px solid black;">{name}</td>
                </tr>

                <tr style="border-bottom: none !important;">
                    <td>RFC:</td>
                    <td style="border-bottom: 1px solid black;">{rfc}</td>
                </tr>

                <tr style="border-bottom: none !important;">
                    <td>CURP:</td>
                    <td style="border-bottom: 1px solid black;">{curp}</td>
                </tr>

                <tr style="border-bottom: none !important;">
                    <td>MATRICULA:</td>
                    <td style="border-bottom: 1px solid black;">{mat}</td>
                </tr>

                <tr style="border-bottom: none !important;">
                    <td>CENTRO DE TABRAJO:</td>
                    <td style="border-bottom: 1px solid black;">CENTRO DE ALTA ESPECIALIDAD DR. RAFAEL LUCIO</td>
                </tr>

                <tr style="border-bottom: none !important;">
                    <td>CLUES:</td>
                    <td style="border-bottom: 1px solid black;">VZIMB002330</td>
                </tr>

            </thead>
        </table>

        <table>
            <tbody>
                <tr style="border-bottom: none !important;">
                    <td>NOMINA:</td>
                    <td style="border-bottom: 1px solid black;">{nom}</td>
                </tr>
                <tr style="border-bottom: none !important;">
                    <td>TURNO:</td>
                    <td style="border-bottom: 1px solid black;">{turno}</td>
                </tr>

                <tr style="border-bottom: none !important;">
                    <td>HORARIO:</td>
                    <td style="border-bottom: 1px solid black;">{hour}</td>
                </tr>

                <tr style="border-bottom: none !important;">
                    <td>GUARDIAS:</td>
                    <td style="border-bottom: 1px solid black;">{guards}</td>
                </tr>

                <tr style="border-bottom: none !important;">
                    <td>CATEGORIA:</td>
                    <td style="border-bottom: 1px solid black;">{cat}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="container-lg">
        <table class="table">
            <thead class="thead-dark">
                <tr>
                    <th>MATRICULA</th>
                    <th>NOMBRE TRABAJADOR</th>
                    <th>TIPO EMPLEADO</th>
                    <th>RFC</th>
                    <th>HORARIO</th>
                    <th>GUARDIAS</th>
                    <th>FECHA</th>
                    <th>ENTRADA</th>
                    <th>SALIDA</th>
                    <th>EVENTO</th>
                </tr>
            </thead>

            {table_body}
               
        </table>
    </div>
</main>

<footer style="page-break-inside: avoid !important;">
    <div id="main-footer-content" class="container-fluid text-center">

        <div class="row mt-3">
            <div class="col-sm-6 justify-content-center">
                <span style="font-weight: bold; font-size: 15px">ENCARGADO CONTROL ASISTENCIAL</span>
            </div>
            <div class="col-sm-6 justify-content-center">
                <span style="font-weight: bold; font-size: 15px">CERTIFICÓ</span>
            </div>
        </div>
        <div class="row mt-3" style="margin-bottom: 60px; display: flex; justify-content: space-around;">
            <div class="col-sm-4 justify-content-center" style="position: relative;">
                <span>ING. ROSA MARIAL FLORES SOSA</span>
                <div style="border-top: 1px solid black;">
                    <span style="font-size: 14px;">JEFA DE RECURSOS HUMANOS</span>
                </div>
                <img src="{firma1}" width="100px" height="100px" style="position: absolute; top: -70%; left: 37.5%;" />
            </div>
            <div class="col-sm-4 justify-content-center" style="position: relative;">
                <span>LIC. RUBEN VAZQUEZ RASGADO</span>
                <div style="border-top: 1px solid black;">
                    <span style="font-size: 14px;">ADMINISTRADOR CAE</span>
                </div>
                <img src="{firma1}" width="100px" height="100px" style="position: absolute; top: -70%; left: 37.5%;" />
            </div>
        </div>
        
        <div class="row">
            <div class="col-sm-12 justify-content-center">
                <span style="font-weight: bold; font-size: 15px">TITULAR DE LA UNIDAD</span>
            </div>
        </div>
        <div class="row mt-3" style="margin-bottom: 30px; display: flex; justify-content: space-around;">
            <div class="col-sm-12 justify-content-center" style="position: relative;">
                <span>DR. RAFAEL NORBERTO HERNANDEZ GOMEZ</span>
                <div style="border-top: 1px solid black; width: 40%; display: flex; margin: auto;">
                    <span style="font-size: 14px; display: flex; margin: auto;">DIRECTOR CAE</span>
                </div>
                <img src="{firma1}" width="100px" height="100px" style="position: absolute; top: -70%; left: 45.7%;" />
            </div>
        </div>
    </div>
</footer>
</div>
`;
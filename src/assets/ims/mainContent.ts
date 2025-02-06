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
    <div id="tile" style="font-weight: bold; position: relative;"
        class="d-flex align-items-center justify-content-center">
        REGISTRO DE ASISTENCIA
    </div>
    <div class="container-lg d-flex justify-content-end pb-3">

        <div>
            <span class="ml-4" style="margin-right: 10px;">
                MES:
            </span>

            <span style="text-decoration: underline;">
                {quince}
            </span>
        </div>
    </div>

    <div class="table d-flex justify-content-between container-sm pb-3">
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

    <div style="padding-left: 15px; padding-right: 15px; width: 100%;">
        <table class="table" style="width: 100%;">
            <thead class="thead-dark">
                <tr>
                    <th style="width: 5%;">MATRICULA</th>
                    <th style="width: 20%;">NOMBRE TRABAJADOR</th>
                    <th style="width: 10%;">TIPO EMPLEADO</th>
                    <th style="width: 5%;">RFC</th>
                    <th style="width: 5%;">HORARIO</th>
                    <th style="width: 25%;">GUARDIAS</th>
                    <th style="width: 10%;">FECHA</th>
                    <th style="width: 5%;">ENTRADA</th>
                    <th style="width: 5%;">SALIDA</th>
                    <th style="width: 10%;">EVENTO</th>
                </tr>
            </thead>
            {table_body}
        </table>
    </div>
</main>

<footer style="page-break-inside: avoid !important;">
    <div id="main-footer-content" class="container-fluid text-center">
        <div class="row mt-3">
            <div class="col-sm-4 justify-content-center">
                <span style="font-weight: bold; font-size: 12px">ENCARGADO CONTROL ASISTENCIAL</span>
            </div>
            <div class="col-sm-4 justify-content-center">
                <span style="font-weight: bold; font-size: 12px">CERTIFICÓ</span>
            </div>
            <div class="col-sm-4 justify-content-center">
                <span style="font-weight: bold; font-size: 12px">TITULAR DE LA UNIDAD</span>
            </div>
        </div>
        <div class="row mt-3" style="margin-bottom: 60px; display: flex; justify-content: space-evenly;">
            <div class="col-sm-4 justify-content-center" style="position: relative;">
                <span style="font-size: 14px;">ING. ROSA MARIA FLORES SOSA</span>
                <div style="border-top: 1px solid black; width: 300px; margin-left: auto; margin-right: auto;">
                    <span style="font-size: 12px;">JEFA DE RECURSOS HUMANOS</span>
                </div>
                <img src="{firma1}" width="100px" height="100px" style="position: absolute; top: -70%; left: 37.5%;" />
            </div>
            <div class="col-sm-4 justify-content-center" style="position: relative;">
                <span style="font-size: 14px;">LIC. RUBEN VAZQUEZ RASGADO</span>
                <div style="border-top: 1px solid black; width: 300px; margin-left: auto; margin-right: auto;">
                    <span style="font-size: 12px;">ADMINISTRADOR CAE</span>
                </div>
                <img src="{firma1}" width="100px" height="100px" style="position: absolute; top: -70%; left: 37.5%;" />
            </div>
            <div class="col-sm-4 justify-content-center" style="position: relative;">
                <span style="font-size: 14px;">DR. RAFAEL NORBERTO HERNANDEZ GOMEZ</span>
                <div style="border-top: 1px solid black; width: 300px; display: flex; margin: auto;">
                    <span style="font-size: 12px; display: flex; margin: auto;">DIRECTOR CAE</span>
                </div>
                <img src="{firma1}" width="100px" height="100px" style="position: absolute; top: -70%; left: 37.5%;" />
            </div>
        </div>
    </div>
</footer>
</div>
`;
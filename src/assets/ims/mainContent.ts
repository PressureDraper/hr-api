export const imsReportMainContent = `

<div style="position: relative; min-height: 100%; width: 100%;">

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
                    <td style="border-bottom: 1px solid black;">CAE. DR. RAFAEL LUCIO</td>
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

<footer style="bottom: 0; width: 100%; margin-bottom: 15px; margin-top: 20px;">
    <div id="main-footer-content" class="d-flex container-lg text-center">
        <div>
            <span style="font-weight: bold;">JEFE DE SERVICIO:</span>
            <span>{booss}</span>
        </div>

        <div>
            <span style="font-weight: bold;">TITULAR DE LA UNIDAD:</span>
            <span>DR. RAFAEL NORBERTO HERNANDEZ GOMEZ</span>
        </div>

        <div>
            <span style="font-weight: bold;">ENCARGADO CONTROL DE ASISTENCIA:</span>
            <span>ING. ROSA MARIAL FLORES SOSA</span>
        </div>

        <div>
            <span style="font-weight: bold;">CERTIFICO</span>
            <span>LIC. RUBEN VAZQUEZ RASGADO</span>
        </div>
    </div>

    <div id="sub-footer-content" class="d-flex container-lg text-center justify-content-between"
        style="margin-top: 4rem;">

        <div style="text-align: center; margin-top: 30px; position: relative;">
            <div style="border-top: 2px solid black; width: 300px; margin: 0 auto; margin-bottom: 10px;"></div>
            <span>JEFE/A DEL AREA DE {area}</span>
        </div>

        <div style="text-align: center; margin-top: 30px; position: relative;">
            <div style="border-top: 2px solid black; width: 300px; margin: 0 auto; margin-bottom: 10px;"></div>
            <span>DIRECTOR CAE</span>
        </div>

        <div style="text-align: center; margin-top: 30px; position: relative;">
            <div style="border-top: 2px solid black; width: 300px; margin: 0 auto; margin-bottom: 10px;"></div>
            <span>JEFA DE RECURSOS HUMANOS</span>
        </div>

        <div style="text-align: center; margin-top: 30px; position: relative;">
            <div style="border-top: 2px solid black; width: 300px; margin: 0 auto; margin-bottom: 10px;"></div>
            <span>ADMINISTRADOR CAE</span>
        </div>

    </div>
</footer>

<div style="heigh: 1000px"></div>
</div>
<div class="page-break"></div>


`;
export const newImssReportMainContent = `
    <section class="main" style="flex-grow: 1; page-break-before: always; position: relative;">
        <div class="container-fluid">
            <div class="row">
                <div class="col-sm-6 d-flex justify-content-start">
                    <img width="90%" height="65px" style="margin-top: 5px;" src="data:image/png;base64, {imga}" />
                </div>
                <div class="col-sm-6 d-flex justify-content-end">
                    <img width="70px" height="70px" src="data:image/png;base64, {imgb}" />
                </div>
            </div>
            <div class="row">
                <div class="col-sm-12 d-flex justify-content-center">
                    <p>COORDINACIÓN ESTATAL DE VERACRUZ IMSS BIENESTAR</p>
                </div>
            </div>
            <div class="row d-flex justify-content-center mx-auto" style="width: 95vw;">
                <div class="col-sm-6 d-flex flex-column justify-content-center align-items-start">
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <span style="display: flex;" class="description">NOMBRE:</span>
                        <span class="paramsBox description">{name}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <span class="description">RFC:</span>
                        <span class="paramsBox" style="font-size: 11.3px;">{rfc}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <span class="description">CURP:</span>
                        <span class="paramsBox" style="font-size: 11.3px;">{curp}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <span class="description">CÓDIGO DE PUESTO:</span>
                        <span class="paramsBox description">{code}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <span class="description">SERVICIO AL QUE PERTENECE:</span>
                        <span class="paramsBox description">{area}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <span class="description">HOSPITAL Y/O JURISDICCIÓN:</span>
                        <span class="paramsBox description">CAE</span>
                    </div>
                </div>
                <div class="col-sm-6 d-flex flex-column justify-content-center align-items-start">
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <span class="description">JORNADA Y HORARIO:</span>
                        <span class="paramsBox description">{turno} / {hour}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <span class="description">N° QNA Y AÑO:</span>
                        <span class="paramsBox" style="font-size: 11.3px;">{quince}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <span class="description">CLUES:</span>
                        <span class="paramsBox" style="font-size: 11.3px;">VZIMB002330</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <span class="description">DESCRIPCIÓN DEL PUESTO:</span>
                        <span class="paramsBox description">{catFederal}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <span class="description">HOSPITAL:</span>
                        <span class="paramsBox description">CAE</span>
                    </div>
                </div>
            </div>
            <div class="row d-flex justify-content-center mx-auto" style="width: 95vw;">
                <table class="table" style="table-layout: auto; width: 100%;">
                    <thead class="thead-dark">
                        <tr>
                            <th style="width: 15%">MATRICULA</th>
                            <th style="width: 15%">FECHA</th>
                            <th style="width: 20%">HORA ENTRADA</th>
                            <th style="width: 20%">HORA SALIDA</th>
                            <th style="width: 30%">OBSERVACIONES</th>
                        </tr>
                    </thead>
                    {table_body}
                </table>
            </div>
            <div class="col-sm-8 d-flex flex-column justify-content-center align-items-start" style="padding-left: 15px;">
                <span style="display: flex;" class="description footerTitle">DIA QUE SE DESCUENTA: <span style="font-size: 11px; font-weight: 500; margin-left: 5px; margin-top: -1px; margin-bottom: 0px;">{diasDescuento}</span></span>
                <span style="display: flex;" class="description footerTitle">DIA DE OMISIÓN ENTRADA / SALIDA: <span style="font-size: 11px; font-weight: 500; margin-left: 5px; margin-top: -1px; margin-bottom: 0px;">{diasOmision}</span></span>
                <span style="display: flex;" class="description footerTitle">DIA DE SUSPENSIÓN: <span style="font-size: 11px; font-weight: 500; margin-left: 5px; margin-top: -1px; margin-bottom: 0px;">{diasSuspension}</span></span>
                <span style="display: flex;" class="description footerTitle">HOSPITAL RESPONSABLE: <span style="font-size: 11px; font-weight: 500; margin-left: 5px; margin-top: -1px; margin-bottom: 0px;"> CAE</span></span>
            </div>
        </div>
    </section>
`
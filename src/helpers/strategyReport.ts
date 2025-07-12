import { PropsFormatoEstrategia } from "../interfaces/reportsQueries";
import { logo_imss, logo_mujer_2025, logo_sheinbaum, logoSesver } from '../helpers/images';
import moment from "moment";
import { SignService } from "../controllers/presentation/services/sign.service";
import { cambiarFirmaAzulANegro } from "./changeSignColor";

//REPORTE ESTRATEGIA SESVER
export const htmlParams = (params: PropsFormatoEstrategia) => {
    moment.locale('es-mx');

    return {
        imga: logoSesver,
        currentDate: moment.utc().subtract(6, 'hour').format('LLLL').toUpperCase(),
        tname: params.titular.cmp_persona.nombres + ' ' + params.titular.cmp_persona.primer_apellido + ' ' + params.titular.cmp_persona.segundo_apellido,
        folium: params.folium,
        sname: params.suplente.cmp_persona.nombres + ' ' + params.suplente.cmp_persona.primer_apellido + ' ' + params.suplente.cmp_persona.segundo_apellido,
        tenrollment: params.titular.matricula,
        senrollment: params.suplente.matricula,
        tcategory: params.titular.cat_categorias.nombre,
        scategory: params.suplente.cat_categorias.nombre,
        tdepartment: params.titular.cat_departamentos.nombre,
        sdepartment: params.suplente.cat_departamentos.nombre,
        tshift: params.titular.cat_turnos.nombre,
        sshift: params.suplente.cat_turnos.nombre,
        tschedule: moment.utc(params.titular.hora_entrada).format('HH:mm') + ' A ' + moment.utc(params.titular.hora_salida).format('HH:mm'),
        sschedule: moment.utc(params.suplente.hora_entrada).format('HH:mm') + ' A ' + moment.utc(params.suplente.hora_salida).format('HH:mm'),
        newShift: params.dateFin === null ? moment.utc(params.dateInit).format('L').toUpperCase() : moment.utc(params.dateInit).format('L').toUpperCase() + ' AL ' + moment.utc(params.dateFin).format('L').toUpperCase(),
        tchange: params.titularHoraEntrada === null ? 'NO APLICA' : 'DE ' + params.titularHoraEntrada + ' A ' + params.titularHoraSalida + ' HRS',
        schange: params.substituteHoraEntrada === null ? 'NO APLICA' : 'DE ' + params.substituteHoraEntrada + ' A ' + params.substituteHoraSalida + ' HRS',
    }
}

const weekDays: string[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO', 'FESTIVOS'];

//REPORTE ESTRATEGIA IMSS
export const htmlParamsIMSS = async (params: PropsFormatoEstrategia) => {
    moment.locale('es-mx');

    const tdaysoff = weekDays.filter((day: string) => !JSON.parse(decodeURIComponent(params.titular.guardias)).includes(day));
    const sdaysoff = weekDays.filter((day: string) => !JSON.parse(decodeURIComponent(params.suplente.guardias)).includes(day));

    const sings = new SignService();
    let firma_director: any = await sings.getLastSingByUserId(1680);
    let firma_encargado_rh: any = await sings.getLastSingByUserId(4521);

    let firma_director_negro = await cambiarFirmaAzulANegro(firma_director[0].firma);
    let firma_encargado_rh_negro = await cambiarFirmaAzulANegro(firma_encargado_rh[0].firma);

    return {
        imga: logo_imss,
        imgb: logo_sheinbaum,
        imgc: logo_mujer_2025,
        firma_director: firma_director_negro,
        firma_encargado_rh: firma_encargado_rh_negro,
        folium: params.folium,
        currentDate: moment.utc().subtract(6, 'hour').format('L').toUpperCase(),
        tname: params.titular.cmp_persona.nombres + ' ' + params.titular.cmp_persona.primer_apellido + ' ' + params.titular.cmp_persona.segundo_apellido,
        trfc: params.titular.cmp_persona.rfc,
        tcurp: params.titular.cmp_persona.curp,
        tdepartment: params.titular.cat_departamentos.nombre,
        tcategory: params.titular.cat_categorias.nombre,
        tshift: params.titular.cat_turnos.nombre,
        tguards: JSON.parse(decodeURIComponent(params.titular.guardias)).join(','),
        tschedule: moment.utc(params.titular.hora_entrada).format('HH:mm') + ' - ' + moment.utc(params.titular.hora_salida).format('HH:mm'),
        tdaysoff: tdaysoff.length > 0 ? tdaysoff.join(',') : '-',
        sname: params.suplente.cmp_persona.nombres + ' ' + params.suplente.cmp_persona.primer_apellido + ' ' + params.suplente.cmp_persona.segundo_apellido,
        srfc: params.suplente.cmp_persona.rfc,
        scurp: params.suplente.cmp_persona.curp,
        sdepartment: params.suplente.cat_departamentos.nombre,
        scategory: params.suplente.cat_categorias.nombre,
        sshift: params.suplente.cat_turnos.nombre,
        sguards: JSON.parse(decodeURIComponent(params.suplente.guardias)).join(','),
        sschedule: moment.utc(params.suplente.hora_entrada).format('HH:mm') + ' A ' + moment.utc(params.suplente.hora_salida).format('HH:mm'),
        sdaysoff: sdaysoff.length > 0 ? sdaysoff.join(',') : '-',
        schange: params.substituteHoraEntrada === null ? 'NO APLICA' : 'DE ' + params.substituteHoraEntrada + ' A ' + params.substituteHoraSalida + ' HRS',
        newShift: params.dateFin === null ? moment.utc(params.dateInit).format('L').toUpperCase() : moment.utc(params.dateInit).format('L').toUpperCase() + ' AL ' + moment.utc(params.dateFin).format('L').toUpperCase(),
    }
}

export const templateEstrategia =
    `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
    <title>Formato Estrategia</title>
    <style>
        p {
            margin-bottom: -1px;
        }

        .roundedBox {
            width: 100%;
            height: 'auto';
            border: 2px solid black;
            border-radius: 10px;
        }

        .titleBox {
            font-weight: 500;
        }

        .paramsBox {
            font-weight: 400;
            text-decoration: underline black;
        }

        .bodyBox {
            font-weight: 300;
        }

        .signLine6 {
            width: 70%;
            border-top: 1px solid black;
        }

        .signLine12 {
            width: 40%;
            border-top: 1px solid black;
        }

        b {
            font-size: 14px;
        }
    </style>
</head>
<body>
    <section class="main">
        <div class="container-fluid">
            <div class="row">
                <div class="col-sm-12 d-flex justify-content-center">
                    <img width="100%" height="90%" src="data:image/png;base64, {imga}" />
                </div>
            </div>
            <div class="row">
                <div class="col-sm-7 d-flex">
                    <div class="m-3">
                        <p>SECRETARIA DE SALUD</p>
                        <p>DIRECCIÓN ADMINISTRATIVA</p>
                        <p>SUBDIRECCIÓN DE RECURSOS HUMANOS</p>
                        <p>FECHA: <b>{currentDate}</b></p>
                        <p>FOLIO: <b>{folium}</b> </p>
                    </div>
                </div>
                <div class="col-sm-5 d-flex flex-row-reverse">
                    <div class="m-3">
                        <h6>FORMATO: SRH03-FACH</h6>
                    </div>
                </div>
            </div>
            <div class="row" style="margin-top: -5px;">
                <div class="col-sm-12 d-flex">
                    <div class="m-3 roundedBox">
                        <div class="row m-2">
                            <div class="col-sm-12 d-flex justify-content-center mb-3">
                                <span class="titleBox">TITULAR</span>
                            </div>
                            <div class="col-sm-8 d-flex mb-2">
                                <span class="bodyBox">NOMBRE: <span class="paramsBox" >{tname}</span></span>
                            </div>
                            <div class="col-sm-4 d-flex">
                                <span class="bodyBox">MATRICULA: <span class="paramsBox" >{tenrollment}</span></span>
                            </div>
                            <div class="col-sm-8 d-flex mb-2">
                                <span class="bodyBox">ADSCRIPCIÓN: <span class="paramsBox">{tdepartment}</span></span>
                            </div>
                            <div class="col-sm-4 d-flex">
                                <span class="bodyBox">TURNO: <span class="paramsBox">{tshift}</span></span>
                            </div>
                            <div class="col-sm-8 d-flex mb-2">
                                <span class="bodyBox">CATEGORÍA: <span class="paramsBox">{tcategory}</span></span>
                            </div>
                            <div class="col-sm-4 d-flex">
                                <span class="bodyBox">HORARIO: <span class="paramsBox">{tschedule}</span></span>
                            </div>
                            <div class="col-sm-12 d-flex mb-2">
                                <span class="bodyBox">FECHA A SUSTITUIR: <span class="paramsBox">{newShift}</span></span>
                            </div>
                            <div class="col-sm-12 d-flex justify-content-center mb-2">
                                <span class="titleBox">CAMBIO DE HORARIO</span>
                            </div>
                            <div class="col-sm-12 d-flex">
                                <span class="bodyBox">HORARIO SOLICITADO: <span class="paramsBox">{tchange}</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row" style="margin-top: -5px;">
                <div class="col-sm-12 d-flex">
                    <div class="m-3 roundedBox">
                        <div class="row m-2">
                            <div class="col-sm-12 d-flex justify-content-center mb-3">
                                <span class="titleBox">SUPLENTE</span>
                            </div>
                            <div class="col-sm-8 d-flex mb-2">
                                <span class="bodyBox">NOMBRE: <span class="paramsBox" >{sname}</span></span>
                            </div>
                            <div class="col-sm-4 d-flex">
                                <span class="bodyBox">MATRICULA: <span class="paramsBox" >{senrollment}</span></span>
                            </div>
                            <div class="col-sm-8 d-flex">
                                <span class="bodyBox">ADSCRIPCIÓN: <span class="paramsBox">{sdepartment}</span></span>
                            </div>
                            <div class="col-sm-4 d-flex mb-2">
                                <span class="bodyBox">TURNO: <span class="paramsBox">{sshift}</span></span>
                            </div>
                            <div class="col-sm-8 d-flex mb-2">
                                <span class="bodyBox">CATEGORÍA: <span class="paramsBox">{scategory}</span></span>
                            </div>
                            <div class="col-sm-4 d-flex">
                                <span class="bodyBox">HORARIO: <span class="paramsBox">{sschedule}</span></span>
                            </div>
                            <div class="col-sm-12 d-flex justify-content-center m-2">
                                <span class="titleBox">CAMBIO DE HORARIO</span>
                            </div>
                            <div class="col-sm-12 d-flex">
                                <span class="bodyBox">HORARIO SOLICITADO: <span class="paramsBox">{schange}</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row" style="margin-top: 50px;">
                <div class="col-sm-6 d-flex justify-content-center">
                    <div class="signLine6 text-center">
                        <span>Titular</span>
                    </div>
                </div>
                <div class="col-sm-6 d-flex justify-content-center">
                    <div class="signLine6 text-center">
                        <span>Suplente</span>
                    </div>
                </div>
            </div>
            <div class="row" style="margin-top: 70px;">
                <div class="col-sm-12 d-flex justify-content-center">
                    <div class="signLine12 text-center">
                        <span>Vo. Bo. JEFATURA</span>
                    </div>
                </div>
            </div>
            <div class="row" style="margin-top: 25px;">
                <div class="col-sm-12 d-flex justify-content-center">
                    <span style="font-weight: bold; font-style: italic; font-size: 13px;">TRABAJADOR: "ASUMO EL COMPROMISO DE CUBRIR EL AUSENTISMO GENERADO DEL TRABAJADOR"</span>
                </div>
            </div>
        </div>
    </section>
</body>
</html>`;

export const templateEstrategiaIMSS =
    `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
        integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
    <title>Formato Estrategia IMSS</title>
    <style>
        p {
            font-size: 15px;
            margin-bottom: -1px;
            font-weight: 600;
        }

        .subtitle {
            font-weight: 500;
        }

        .row {
            margin-bottom: 9px;
        }

        .paramsBox {
            border-bottom: 1px solid black;
        }

        span {
            display: block;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .linedata {
            display: block;
            font-size: 14px;
            margin-bottom: 0px;
        }

        .description {
            font-size: 11.5px;
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

<body>
    <section class="main">
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
                    <p>Anexo 1</p>
                </div>
                <div class="col-sm-12 d-flex justify-content-center">
                    <p>SERVICIOS DE SALUD DEL INSTITUTO MEXICANO DEL SEGURO SOCIAL</p>
                </div>
                <div class="col-sm-12 d-flex justify-content-center">
                    <p>PARA EL BIENESTAR (IMSS-BIENESTAR)</p>
                </div>
            </div>
            <div class="row">
                <div class="col-sm-12 d-flex justify-content-center">
                    <p class="subtitle">"SUSTITUCIÓN TRABAJADOR POR TRABAJADOR, TxT"</p>
                </div>
                <div class="col-sm-12 d-flex justify-content-center">
                    <p class="subtitle">CÉDULA DE AUTORIZACIÓN</p>
                </div>
            </div>
            <div class="row d-flex justify-content-center mx-auto" style="width: 95vw;">
                <div class="col-sm-3 d-flex flex-column justify-content-center align-items-start">
                    <span class="description">COORDINACIÓN ESTATAL:</span>
                    <span class="description">CLUE:</span>
                </div>
                <div class="col-sm-4 justify-content-center">
                    <span class="paramsBox description">VERACRUZ</span>
                    <span class="paramsBox description">VZIMB002330</span>
                </div>
                <div class="col-sm-2 d-flex flex-column justify-content-center align-items-end">
                    <span class="description">FOLIO:</span>
                    <span class="description">LUGAR Y FECHA:</span>
                </div>
                <div class="col-sm-3 justify-content-center">
                    <span class="paramsBox description" style="font-weight: bold;">{folium}</span>
                    <span class="paramsBox description">XALAPA, VER. A {currentDate}</span>
                </div>
            </div>
            <div class="row d-flex justify-content-center mx-auto" style="width: 95vw;">
                <div class="col-sm-12 d-flex flex-column justify-content-center align-items-start">
                    <span style="letter-spacing: 0.6px; text-align: justify;">Los trabajadores que a continuación se
                        señalan aceptan de conformidad al citado esquema, someter a la aprobación de las autoridades
                        institucionales, la presente cédula de autorización, con los derechos y obligaciones que se contemplan en los Lineamientos "Sustitución Trabajador por Trabajador".</span>
                </div>
            </div>
            <div class="row d-flex justify-content-center mx-auto" style="width: 95vw;">
                <div class="col-sm-6 d-flex flex-column justify-content-center align-items-center">
                    <span class="subtitle">TRABAJADOR</span>
                </div>
                <div class="col-sm-6 d-flex flex-column justify-content-center align-items-center">
                    <span class="subtitle">TRABAJADOR SUSTITUTO</span>
                </div>
            </div>
            <div class="row d-flex justify-content-center mx-auto" style="width: 95vw;">
                <div class="col-sm-2 d-flex flex-column justify-content-center align-items-start">
                    <span class="description">NOMBRE:</span>
                    <span class="description">RFC:</span>
                    <span class="description">CURP:</span>
                    <span class="description">ADSCRIPCIÓN:</span>
                    <span class="description">PUESTO:</span>
                    <span class="description">TURNO:</span>
                    <span class="description">JORNADA:</span>
                    <span class="description">HORARIO:</span>
                    <span class="description">DESCANSOS:</span>
                </div>
                <div class="col-sm-4 justify-content-center">
                    <span class="paramsBox description">{tname}</span>
                    <span class="paramsBox" style="font-size: 11.3px;">{trfc}</span>
                    <span class="paramsBox" style="font-size: 11.3px;">{tcurp}</span>
                    <span class="paramsBox description">{tdepartment}</span>
                    <span class="paramsBox description">{tcategory}</span>
                    <span class="paramsBox description">{tshift}</span>
                    <span class="paramsBox description">{tguards}</span>
                    <span class="paramsBox description">{tschedule} HRS</span>
                    <span class="paramsBox description">{tdaysoff}</span>
                </div>
                <div class="col-sm-2 d-flex flex-column justify-content-center align-items-start">
                    <span class="description">NOMBRE:</span>
                    <span class="description">RFC:</span>
                    <span class="description">CURP:</span>
                    <span class="description">ADSCRIPCIÓN:</span>
                    <span class="description">PUESTO:</span>
                    <span class="description">TURNO:</span>
                    <span class="description">JORNADA:</span>
                    <span class="description">HORARIO:</span>
                    <span class="description">DESCANSOS:</span>
                </div>
                <div class="col-sm-4 justify-content-center">
                    <span class="paramsBox description">{sname}</span>
                    <span class="paramsBox" style="font-size: 11.3px;">{srfc}</span>
                    <span class="paramsBox" style="font-size: 11.3px;">{scurp}</span>
                    <span class="paramsBox description">{sdepartment}</span>
                    <span class="paramsBox description">{scategory}</span>
                    <span class="paramsBox description">{sshift}</span>
                    <span class="paramsBox description">{sguards}</span>
                    <span class="paramsBox description">{sschedule} HRS</span>
                    <span class="paramsBox description">{sdaysoff}</span>
                </div>
            </div>
            <div class="row d-flex justify-content-end mx-auto" style="width: 95vw;">
                <div class="col-sm-2 d-flex flex-column justify-content-center align-items-start">
                    <span class="description">HORARIO A SUSTITUIR:</span>
                    <span class="description">FECHA DE SUSTITUCIÓN:</span>
                </div>
                <div class="col-sm-4 d-flex flex-column justify-content-center gap-3">
                    <span class="paramsBox description">{schange}</span>
                    <span class="paramsBox description">{newShift}</span>
                </div>
            </div>
            <div class="row d-flex justify-content-center mx-auto" style="width: 95vw;">
                <div style="margin-bottom: -50px" class="col-sm-6 d-flex flex-column justify-content-center align-items-center">
                    <span class="description">{tname}</span>
                </div>
                <div style="margin-bottom: -50px" class="col-sm-6 d-flex flex-column justify-content-center align-items-center">
                    <span class="description">{sname}</span>
                </div>
                <div class="col-sm-6 d-flex flex-column justify-content-center align-items-center">
                    <span class="signBox description">FIRMA DEL TRABAJADOR</span>
                </div>
                <div class="col-sm-6 d-flex justify-content-center align-items-center">
                    <span class="signBox description">FIRMA DEL TRABAJADOR SUSTITUTO</span>
                </div>
            </div>
            <div class="row d-flex justify-content-center mx-auto" style="width: 95vw;" style="position: relative;">
                <div class="col-sm-12 d-flex flex-column justify-content-center align-items-center">
                    <span class="description">AUTORIZÓ</span>
                    <span style="position: absolute; margin-top: -28px;" class="description linedata">DR. RAFAEL NORBERTO HERNÁNDEZ GÓMEZ</span>
                    <span style="position: absolute; margin-bottom: -5px;" class="description linedata">DIRECTOR</span>
                    <img src="{firma_director}" width="200px" height="100px" style="position: absolute;" />
                    <span class="signBox description">NOMBRE, PUESTO Y FIRMA DEL RESPONSABLE DEL ESTABLECIMIENTO DE
                        SALUD</span>
                </div>
            </div>
            <div class="row d-flex justify-content-center mx-auto" style="width: 95vw;">
                <div class="col-sm-6 d-flex flex-column justify-content-center align-items-center">
                    <span class="description">Vo. Bo.</span>
                    <span class="signBox description">NOMBRE Y FIRMA DEL JEFE DE SERVICIO</span>
                </div>
                <div class="col-sm-6 d-flex flex-column justify-content-center align-items-center" style="position: relative;">
                    <span class="description">VALIDÓ</span>
                    <span style="position: absolute; margin-bottom: -5px;" class="description linedata">ING. ROSA MARIA FLORES SOSA</span>
                    <img src="{firma_encargado_rh}" width="200px" height="100px" style="position: absolute; margin-left: 30px;" />
                    <span class="signBox description">NOMBRE Y FIRMA DEL ENCARGADO DE RR. HH.</span>
                </div>
            </div>
            <div class="row d-flex justify-content-start mx-left" style="width: 95vw;">
                <div class="col-sm-3 d-flex justify-content-start">
                    <img width="auto" height="70px" src="data:image/png;base64, {imgc}" />
                </div>
                <div class="col-sm-9 d-flex flex-column justify-content-center" style="margin-top: 15px">
                    <span class="description mx-auto" style="font-weight: bold;">Deberá llevar sello del Hospital y/o Jurisdicción</span>
                    <div style="height: 5px; width: 100%; background-color: #6e263c; margin-bottom: 5px; margin-top: -5px;"></div>
                    <span class="description mx-auto">Coordinación Estatal Veracruz - Xalapa de Enríquez, Ver</span>
                </div>
            </div>
        </div>
    </section>
</body>
</html>
`
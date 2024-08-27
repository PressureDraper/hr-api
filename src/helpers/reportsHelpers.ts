import { PropsFormatoEstrategia } from "../interfaces/reportsQueries";
import { logoSesver } from '../helpers/images';
import moment from "moment";

export const htmlParams = (params: PropsFormatoEstrategia) => {
    moment.locale('es-mx');

    return {
        imga: logoSesver,
        currentDate: moment.utc().subtract(6, 'hour').format('LLLL').toUpperCase(),
        tname: params.titular.cmp_persona.nombres + ' ' + params.titular.cmp_persona.primer_apellido + ' ' + params.titular.cmp_persona.segundo_apellido,
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
        tchange: params.titularHoraEntrada === null ? 'NO APLICA' : 'DE ' + params.titularHoraEntrada + ' A ' + params.titularHoraSalida,
        schange: params.substituteHoraEntrada === null ? 'NO APLICA' : 'DE ' + params.substituteHoraEntrada + ' A ' + params.substituteHoraSalida + ' HRS',
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
                        <p>FOLIO: </p>
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
                    <span style="font-weight: bold; font-style: italic; font-size: 10px;">TRABAJADOR: "ASUMO EL COMPROMISO DE CUBRIR EL AUSENTISMO GENERADO DEL TRABAJADOR"</span>
                </div>
            </div>
        </div>
    </section>
</body>
</html>`
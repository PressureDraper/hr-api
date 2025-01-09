import { PropsFormatoEstrategia } from "../interfaces/reportsQueries";
import { logoSesver } from '../helpers/images';
import moment from "moment";
import _, { toString } from "lodash";
import { getAttendanceClassify } from "./attendanceClassify";
import { getBosByAppartment } from "./reportsQueries";

//REPORTE ESTRATEGIA
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

//REPORTE INCIDECIAS IMSS
export const filterByTimeRange = (data: any, mat = 0) => {
    let aux = data.map((item: any) => {
        return {
            ...item,
            hora: moment(item.horaReg, 'HH:mm:ss').hours(),
            min: moment(item.horaReg, 'HH:mm:ss').minutes()

        }
    });

    let groupByHour = _.groupBy(aux, 'hora');
    Object.keys(groupByHour).map(key => {
        groupByHour[key] = groupByHour[key][0];
    });

    if (Object.keys(groupByHour).length > 1) {
        const first: any = groupByHour[Object.keys(groupByHour)[0]];
        const second: any = groupByHour[Object.keys(groupByHour)[1]];

        const firstHour = first['horaReg'];
        const secondHour = second['horaReg']
        const diffInMinutes = moment(secondHour, "HH:mm:ss").diff(moment(firstHour, "HH:mm:ss"), 'minutes');

        if (diffInMinutes < 30) {
            const entries = Object.entries(groupByHour);
            entries.splice(1, 1);
            const newData = Object.fromEntries(entries);
            groupByHour = newData;
        }

    }

    // Plain DATA
    let res = [];
    Object.keys(groupByHour).map(key => {
        res.push(groupByHour[key]);
    });

    let testing: any = [];
    Object.keys(groupByHour).map(key => {
        testing.push(groupByHour[key]);
    });

    return testing;
};

export const addIncidents = async (ids_employees = [], fecha_init = '', fecha_fin = '') => {
    try {
        let arrPromises: any = [];
        ids_employees.map(async (id: any) => {
            arrPromises.push(getAttendanceClassify({ dateInit: fecha_init, dateFin: fecha_fin, id }));
        })

        const data = await Promise.all(arrPromises);
        let res: { [key: number]: any } = {};
        ids_employees.map((id: any, index: number) => {
            res[id] = data[index];
        });

        return res;
    } catch (error) {
        return {};
    }
}

export const parseIncidents = (all: any = {}, date = '', hora_entrada: any, hora_salida: any) => {
    let parseDate = moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD');

    if (all[parseDate]) {//si el dia tiene permisos
        let res = '';
        all[parseDate].map((item: any) => {
            res += `${item['title']} `;
        })
        return res;
    } else if (hora_salida === undefined && hora_entrada.horaReg === '') {//si no hay checadas ni permisos
        return '<span style="color: red;">FALTA</span>'
    }

    return '';
}

export const getAllApartments = async (namesToSearch = []) => {
    try {
        let arrPromises: any = [];
        namesToSearch.map((name: any) => {
            arrPromises.push(getBosByAppartment(name));
        });

        const data = await Promise.all(arrPromises);
        let res: any = {};

        namesToSearch.map((name: any, index: number) => {
            res[name] = data[index];
        });
        return res;
    } catch (error) {
        console.log(error);
        return {};
    }
}

export const translateDays = (workingDays: string[]) => {
    const translatedWorkingDays: string[] = workingDays.map((day: string) => {
        switch (day) {
            case 'LUNES':
                return 'Monday';

            case 'MARTES':
                return 'Tuesday';

            case 'MIERCOLES':
                return 'Wednesday';

            case 'JUEVES':
                return 'Thursday';

            case 'VIERNES':
                return 'Friday';

            case 'SABADO':
                return 'Saturday'

            case 'DOMINGO':
                return 'Sunday'

            default:
                return '';
        }
    });

    return translatedWorkingDays;
}

export const parseWorkingDays = (workingDays: string[], fec_inicio: string, fec_final: string, festivos: any) => {
    if (workingDays === null || workingDays === undefined) {//quitar este IF cuando los de RH se dignen a poner bien las guardias >:( y no devuelva null
        return [];
    }

    let parsedDays = [];
    let copy_ini = fec_inicio; //crear nuevas instancias de las fechas para evitar bugs
    let copy_end = fec_final;
    let debuggedWorkingDays: {
        dateReg: string;
        day: string;
        horaReg: string;
    }[];

    const translatedDays = translateDays(workingDays);

    while (moment.utc(copy_ini).isSameOrBefore(copy_end)) {
        parsedDays.push({
            dateReg: moment(new Date(copy_ini), 'DD/MM/YYYY').utc().format('ddd, DD MMM YYYY 00:00:00 [GMT]'),
            day: moment(new Date(copy_ini), 'DD/MM/YYYY').utc().format('LLLL').split(',')[0],
            horaReg: ''
        });
        copy_ini = moment(copy_ini).add(1, 'day').toISOString();
    }

    festivos.forEach((item: any) => {
        parsedDays.push({
            dateReg: moment(item.fecha, 'DD/MM/YYYY').utc().format('ddd, DD MMM YYYY 00:00:00 [GMT]'),
            day: 'FESTIVO',
            horaReg: ''
        });
    });

    if (workingDays.includes('FESTIVOS')) {
        debuggedWorkingDays = parsedDays.filter((item) => (translatedDays.includes(item.day) || item.day === 'FESTIVO'));
    } else {
        debuggedWorkingDays = parsedDays.filter((item) => translatedDays.includes(item.day));
    }

    return debuggedWorkingDays;
}

export const debugWorkingDays = (parsedWorkingDays: {
    dateReg: string,
    day: string,
    horaReg: string
}[], festivos: any, attendances: any, notParsedWorkingDays: string[]) => {
    if (parsedWorkingDays.length === 0) {//quitar este IF cuando los de RH se dignen a poner bien las guardias >:( y no devuelva null
        return [];
    }

    let purgeDays: string[] = [];
    const allAttendances = _.values(attendances);

    if (!notParsedWorkingDays.includes('FESTIVOS')) { //si no labora festivos
        festivos.forEach((item: any) => {
            purgeDays.push(moment(item.fecha, 'DD/MM/YYYY').utc().format('ddd, DD MMM YYYY 00:00:00 [GMT]'));
        });
    }

    allAttendances.forEach((item: any) => {
        if (item[0] !== null) {
            purgeDays.push(item[0].dateReg);
        }

        if (item[1] !== null && item[1] !== undefined) {
            purgeDays.push(item[1].dateReg);
        }
    });

    let debuggedDays = parsedWorkingDays.filter((item) => !purgeDays.includes(item.dateReg));

    return debuggedDays;
}

export const isComingOrOut = (eval_hour: string, star_hour: string, end_hour: string) => {
    const horaFormateada = moment(eval_hour, "HH:mm").format('HH:mm');
    const horaSalidaPermitida = moment(end_hour, "HH:mm").subtract(2, 'hours').format('HH:mm'); //hora de salida menos 2 horas si es que pide pase
    const horaSalidaLimite = moment(end_hour, "HH:mm").add(3, 'hour').add(59, 'minutes').format('HH:mm'); //4 horas despues de la salida

    if (horaFormateada <= horaSalidaLimite && horaFormateada >= horaSalidaPermitida ) {
        return 'SALIDA'
    } else {
        return 'ENTRADA'
    }

};

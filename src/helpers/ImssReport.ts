import { IOPermisosInterface } from "../interfaces/reportsQueries";
import moment from "moment";
import _ from "lodash";
import { getBosByAppartment } from "./reportsQueries";

//REPORTE INCIDECIAS IMSS
export const generateRow = (item1: any, item2: any) => {
    const dateItem = moment.utc(new Date(item2['dateReg'])).format('DD/MM/YYYY');
    const event = item2.event || '';

    let guard = JSON.parse(item1.guardias) || [];
    guard = guard.join(', ');

    return `
        <tr>
            <td>${item1.matricula}</td>
            <td>${item1.cmp_persona.nombres} ${item1.cmp_persona.primer_apellido} ${item1.cmp_persona.segundo_apellido}</td>
            <td>${item1.cat_tipos_empleado.nombre}</td>
            <td>${item1.cmp_persona.rfc}</td>
            <td>${item1.hora_entrada} - ${item1.hora_salida}</td>
            <td>${guard}</td>
            <td>${dateItem}</td>
            <td>${item2.type === 'ENTRADA' ? item2['horaReg'] : ''}</td>
            <td>${item2.type === 'SALIDA' ? item2['horaReg'] : ''}</td>
            <td>${event}</td>
        </tr>
    `;
};

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
    if (workingDays === null || workingDays === undefined) {
        return [];
    }

    let parsedDays: any[] = [];
    let copy_ini = fec_inicio; //crear nuevas instancias de las fechas para evitar bugs
    let copy_end = fec_final;
    let debuggedWorkingDays: {
        dateReg: string;
        day: string;
        horaReg: string;
        type: string;
        event: string;
    }[];

    const translatedDays = translateDays(workingDays);

    while (moment.utc(copy_ini).isSameOrBefore(copy_end)) {
        parsedDays.push({
            dateReg: moment(new Date(copy_ini), 'DD/MM/YYYY').utc().format('ddd, DD MMM YYYY 00:00:00 [GMT]'),
            day: moment(new Date(copy_ini), 'DD/MM/YYYY').utc().format('LLLL').split(',')[0],
            horaReg: '',
            type: 'EVENTO',
            event: '<span style="color: red;">FALTA</span>'
        });
        copy_ini = moment(copy_ini).add(1, 'day').toISOString();
    }

    festivos.forEach((item: any) => {
        parsedDays.push({
            dateReg: moment(item.fecha, 'DD/MM/YYYY').utc().format('ddd, DD MMM YYYY 00:00:00 [GMT]'),
            type: 'EVENTO FESTIVO',
            event: '<span style="color: red;">FALTA</span>',
        });
    });

    //Devuelve solo los dias laborales del empleado y festivos si aplica
    if (workingDays.includes('FESTIVOS')) {
        debuggedWorkingDays = parsedDays.filter((item) => (translatedDays.includes(item.day) || item.type === 'EVENTO FESTIVO'));
    } else {
        debuggedWorkingDays = parsedDays.filter((item) => translatedDays.includes(item.day));
    }

    return [debuggedWorkingDays, translatedDays];
}

export const debugWorkingDays = (parsedWorkingDays: any, festivos: any, attendances: any, notParsedWorkingDays: string[]) => {
    if (parsedWorkingDays.length === 0) {//quitar este IF cuando los de RH se dignen a poner bien las guardias >:( y no devuelva null
        return [];
    }

    let purgeDays: string[] = [];

    if (!notParsedWorkingDays.includes('FESTIVOS')) { //si no labora festivos
        festivos.forEach((item: any) => {
            purgeDays.push(moment(item.fecha, 'DD/MM/YYYY').utc().format('ddd, DD MMM YYYY 00:00:00 [GMT]'));
        });
    }

    attendances.forEach((item: any) => {
        purgeDays.push(item.dateReg);
    });

    let debuggedDays = parsedWorkingDays[0].filter((item: any) => !purgeDays.includes(item.dateReg));

    return attendances.concat(debuggedDays);
}

const horariosMafufos = [
    { matricula: 7461, hora_entrada2: '07:00:00', hora_salida2: '21:30:00' },
    { matricula: 7312, hora_entrada2: '07:30:00', hora_salida2: '22:00:00' }
];

export const isComingOrOut = (hora_entrada: string, checadas: any[], employee: any) => {
    let horaEntradaLimite = moment(hora_entrada, "HH:mm:ss").add(2, 'hours').format('HH:mm:ss');
    let horaEntradaPermitida: string = ''; //variable en función del tipo de empleado

    if (employee.cat_tipos_empleado.nombre.includes('BASE IMSS BIENESTAR')) {
        horaEntradaPermitida = moment(hora_entrada, "HH:mm:ss").subtract(1, 'hour').format("HH:mm:ss"); //1 hora antes de hora de entrada
    } else { //cualquier otro empleado que no sea base imss bienestar
        horaEntradaPermitida = moment(hora_entrada, "HH:mm:ss").subtract(30, 'minutes').format("HH:mm:ss"); //30 minutos antes de hora de entrada
    }

    //verificar si el empleado tiene otro horario aparte del primario
    const arrSegundoHorario = horariosMafufos.filter((item) => item.matricula === employee.matricula);
    let checadasClasificadas: any[] = [];

    if (arrSegundoHorario.length > 0) { //si tiene otro horario
        const horaEntradaLimite2 = moment(arrSegundoHorario[0].hora_entrada2, "HH:mm:ss").add(2, 'hours').format('HH:mm:ss');
        const horaEntradaPermitida2 = moment(arrSegundoHorario[0].hora_entrada2, "HH:mm:ss").subtract(1, 'hour').format("HH:mm:ss"); //1 hora antes de hora de entrada

        checadas.forEach((item) => {
            let itemAux = { ...item };
            if (item.horaReg >= horaEntradaPermitida && item.horaReg <= horaEntradaLimite) {
                if (checadasClasificadas.length > 0 && checadasClasificadas[checadasClasificadas.length - 1].type === 'ENTRADA') {
                    checadasClasificadas.push({
                        ...item,
                        type: 'SALIDA'
                    });
                } else {
                    //VALIDAR SI LA PRIMER CHECADA TOMADA POR LA 15NA ES SALIDA
                    let newDate = moment(moment(itemAux.dateReg).utc()).add(1, 'day').format('ddd, DD MMM YYYY 00:00:00 [GMT]');
                    const isEntrada = checadas.find((item) => item.dateReg === newDate);

                    if (isEntrada) {
                        checadasClasificadas.push({
                            ...item,
                            type: 'ENTRADA'
                        });
                    } else {
                        checadasClasificadas.push({
                            ...item,
                            type: 'SALIDA'
                        });
                    }
                }
            } else if (item.horaReg >= horaEntradaPermitida2 && item.horaReg <= horaEntradaLimite2) {
                if (checadasClasificadas.length > 0 && checadasClasificadas[checadasClasificadas.length - 1].type === 'ENTRADA') {
                    checadasClasificadas.push({
                        ...item,
                        type: 'SALIDA'
                    });
                } else {
                    //VALIDAR SI LA PRIMER CHECADA TOMADA POR LA 15NA ES SALIDA
                    let newDate = moment(moment(itemAux.dateReg).utc()).add(1, 'day').format('ddd, DD MMM YYYY 00:00:00 [GMT]');
                    const isEntrada = checadas.find((item) => item.dateReg === newDate);

                    if (isEntrada) {
                        checadasClasificadas.push({
                            ...item,
                            type: 'ENTRADA'
                        });
                    } else {
                        checadasClasificadas.push({
                            ...item,
                            type: 'SALIDA'
                        });
                    }
                }
            } else {
                checadasClasificadas.push({
                    ...item,
                    type: 'SALIDA'
                });
            }
        });
    } else { //si no tiene otro horario
        checadas.forEach((item) => {
            if (item.horaReg >= horaEntradaPermitida && item.horaReg <= horaEntradaLimite) {
                checadasClasificadas.push({
                    ...item,
                    type: 'ENTRADA'
                });
            } else {
                checadasClasificadas.push({
                    ...item,
                    type: 'SALIDA'
                });
            }
        });
    }

    return checadasClasificadas;
};

const IOPermisos: IOPermisosInterface = {//Obj de permisos para mapear en donde deben aparecer
    'PASE DE SALIDA': {
        type: 'SALIDA'
    },
    'RETARDO MENOR': {
        type: 'ENTRADA'
    },
    'AUTORIZACIÓN DE SALIDA': {
        type: 'ENTRADA' //Aparece en checada de entrada
    },
    'AUTORIZACIÓN DE ENTRADA': {
        type: 'SALIDA' //Aparece en checada de salida
    },
    'J91 RETARDO MENOR': {
        type: 'ENTRADA'
    }
}

export const classifyEventType = (attendances: any, vacaciones: any, permisos: any, employee: any, fec_inicio: string, fec_final: string, hora_entrada: string, parsedWorkingDays: any) => {
    let attendancesAuxWithPermissions: any[] = []; //array de incidencias a anexar a las checadas

    //VACATIONS
    vacaciones.forEach((item: any) => {
        let itemAux = { ...item } //make copy of item to treat them separately and avoid memory problems. important!!!
        while (moment.utc(itemAux.fecha_inicio).isSameOrBefore(moment.utc(itemAux.fecha_fin))) {
            if (moment.utc(itemAux.fecha_inicio).isSameOrAfter(moment.utc(fec_inicio)) && moment.utc(itemAux.fecha_inicio).isSameOrBefore(moment.utc(fec_final))) {
                if (parsedWorkingDays[1].includes(moment(new Date(itemAux.fecha_inicio), 'DD/MM/YYYY').utc().format('LLLL').split(',')[0])) {
                    attendancesAuxWithPermissions.push({
                        dateReg: moment(new Date(itemAux.fecha_inicio), 'DD/MM/YYYY').utc().format('ddd, DD MMM YYYY 00:00:00 [GMT]'),
                        horaReg: '',
                        type: 'EVENTO',
                        event: `VACACIONES ROL ${itemAux.rol}`
                    });
                }
            }
            itemAux.fecha_inicio = moment(itemAux.fecha_inicio).add(1, 'day').toISOString();
        }
    });

    //MINOR DELAY
    let horaEntradaLimite = '';
    let horaEntradaPermitida = '';
    let { nombre: tipo_empleado } = employee.cat_tipos_empleado;

    if (tipo_empleado.includes('BASE IMSS BIENESTAR')) {
        horaEntradaLimite = moment(hora_entrada, "HH:mm:ss").add(6, 'minutes').format('HH:mm:ss');
        horaEntradaPermitida = moment(hora_entrada, "HH:mm:ss").subtract(1, 'hour').format("HH:mm:ss"); //1 hora antes de hora de entrada
    } else { //cualquier otro empleado que no sea base imss bienestar
        horaEntradaLimite = moment(hora_entrada, "HH:mm:ss").add(16, 'minutes').format("HH:mm:ss"); //entrada sin retardo 16 minutos despues
        horaEntradaPermitida = moment(hora_entrada, "HH:mm:ss").subtract(30, 'minutes').format("HH:mm:ss"); //30 minutos antes de hora de entrada
    }

    let classifiedAttendances = attendances.map((item: any) => {
        if (item.type === 'ENTRADA') {
            if (item.horaReg >= horaEntradaPermitida && item.horaReg < horaEntradaLimite) {
                return { ...item, event: '' }
            } else {
                return { ...item, event: 'RETARDO MENOR'}
            }
        } else {
            return { ...item, event: '' }
        }
    });

    //PERMISOS
    let sharedDays: any[] = [];

    //VALIDAR QUE LOS PERMISOS APAREZCAN EN ENTRADA, SALIDA O EN DIA COMPLETO
    permisos.forEach((item: any) => {
        attendancesAuxWithPermissions.push({
            dateReg: moment(new Date(item.fecha_inicio), 'DD/MM/YYYY').utc().format('ddd, DD MMM YYYY 00:00:00 [GMT]'),
            horaReg: '',
            type: 'EVENTO',
            event: `${item.cat_permisos.nombre}`
        });
    });

    classifiedAttendances.forEach((item1: any) => {
        //Obtener de los permisos aquellos que aparecen en dias con checadas
        attendancesAuxWithPermissions.forEach((item2: any, index: number) => {
            if (item1.dateReg === item2.dateReg) {
                attendancesAuxWithPermissions.splice(index, 1); //Quitamos el permiso que corresponde al dia para no repetir la entrada en el push(...)
                sharedDays.push(item2);
            }
        });
    });

    classifiedAttendances.forEach((item1: any) => {
        // Buscar si la fecha de item1 coincide con alguna en array2
        const matchingItem = sharedDays.find(item2 => item2.dateReg === item1.dateReg);

        // Si se encuentra un elemento coincidente, agregar el valor de 'event' dependiendo del permiso a entrada o salida
        if (matchingItem) {
            const permisoType = IOPermisos[matchingItem.event]?.type;

            if (permisoType === item1.type) {

                //si item1.event es '', 
                item1.event += item1.event ? `, ${matchingItem.event}` : matchingItem.event;
            }
        }
    });

    classifiedAttendances.push(...attendancesAuxWithPermissions);

    return classifiedAttendances;
}
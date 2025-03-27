import { IOPermisosInterface } from "../interfaces/reportsQueries";
import _ from "lodash";
import { getBosByAppartment } from "./reportsQueries";
import dayjs from "dayjs";

//REPORTE INCIDECIAS IMSS
export const generateRow = (item1: any, item2: any) => {
    const dateItem = dayjs.utc(item2['dateReg']).format('DD/MM/YYYY');
    const event = item2.event || '';

    let guard = JSON.parse(item1.guardias) || [];
    guard = guard.join(', ');

    return `
        <tr>
            <td>${item1.matricula}</td>
            <td>${item1.cmp_persona.nombres} ${item1.cmp_persona.primer_apellido} ${item1.cmp_persona.segundo_apellido}</td>
            <td>${item1.cat_tipos_empleado.nombre}</td>
            <td>${item1.cmp_persona.rfc}</td>
            <td>${item1.parseHora_entrada} - ${item1.parseHora_salida}</td>
            <td style="font-size: 11px">${guard}</td>
            <td>${dateItem}</td>
            <td>${item2.type === 'ENTRADA' ? item2['horaReg'] : ''}</td>
            <td>${item2.type === 'SALIDA' ? item2['horaReg'] : ''}</td>
            <td style="width: 8%">${event}</td>
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
                return 'Festivos';
        }
    });

    return translatedWorkingDays;
}

export const parseWorkingDays = (workingDays: string[], fec_inicio: string, fec_final: string, festivos: any, empleado: any, vacaciones: any) => {
    if (workingDays === null || workingDays === undefined) {
        return [];
    }

    let parsedDays: any[] = [];
    let base420Especiales: string[] = []; //Array que guarda 1 dia antes y despues de festivos para que no salga falta
    let festivosFormato: string[] = [];
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

    festivos.forEach((item: any) => {
        let itemAux = { ...item };
        base420Especiales.push(dayjs.utc(itemAux.fecha).add(1, 'day').format('YYYY-MM-DD'));
        base420Especiales.push(dayjs.utc(itemAux.fecha).subtract(1, 'day').format('YYYY-MM-DD'));
        festivosFormato.push(dayjs.utc(itemAux.fecha).format('YYYY-MM-DD'));
    });

    while (dayjs.utc(copy_ini).isBefore(copy_end)) {
        let fechaFormateada = dayjs(copy_ini).format('ddd, DD MMM YYYY HH:mm:ss [GMT]');
        let dia = dayjs(copy_ini).format('dddd');

        if (empleado.cat_turnos.nombre === 'ESPECIALES' && empleado.cat_tipos_empleado.nombre === 'BASE 420') {
            if (!base420Especiales.includes(dayjs(copy_ini).format('YYYY-MM-DD'))) {//SI LA FECHA NO SE ENCUENTRA UN DIA ANTES O DESPUES DE ALGUN DIA FESTIVO
                parsedDays.push({
                    dateReg: fechaFormateada,
                    day: dia,
                    horaReg: '',
                    type: 'EVENTO',
                    event: '<span style="color: black;">FALTA</span>'
                });
            }
        } else {
            if (vacaciones.length > 0) {//SI TIENE VACACIONES
                if (!(copy_ini >= dayjs.utc(vacaciones[0].fecha_inicio).format('YYYY-MM-DD') && copy_ini <= dayjs.utc(vacaciones[0].fecha_fin).format('YYYY-MM-DD'))) {//ELIMINA 'FALTA' EN AQUELLOS CASOS DONDE ESTAN DE VACACIONES Y SE ATRAVIESA UN FESTIVO
                    parsedDays.push({
                        dateReg: fechaFormateada,
                        day: dia,
                        horaReg: '',
                        type: 'EVENTO',
                        event: '<span style="color: black;">FALTA</span>'
                    });
                }
            } else {
                parsedDays.push({
                    dateReg: fechaFormateada,
                    day: dia,
                    horaReg: '',
                    type: 'EVENTO',
                    event: '<span style="color: black;">FALTA</span>'
                });
            }
        }
        copy_ini = dayjs(copy_ini).add(1, 'day').format('YYYY-MM-DD');
    }

    festivos.forEach((item: any) => {
        let fechaFormateada = dayjs.utc(item.fecha).format('ddd, DD MMM YYYY HH:mm:ss [GMT]');

        if (workingDays.includes('FESTIVOS')) {//PARA AQUELLOS QUE LABORAN FESTIVOS
            if (vacaciones.length === 0) {
                return
            }

            if (!(item.fecha >= vacaciones[0].fecha_inicio && item.fecha <= vacaciones[0].fecha_fin)) { //ELIMINA 'FALTA' EN AQUELLOS CASOS DONDE ESTAN DE VACACIONES Y SE ATRAVIESA UN FESTIVO
                parsedDays.push({
                    dateReg: fechaFormateada,
                    type: 'EVENTO FESTIVO',
                    event: '<span style="color: black;">FALTA</span>',
                });
            }
        } else {
            parsedDays.push({
                dateReg: fechaFormateada,
                type: 'EVENTO FESTIVO',
                event: '<span style="color: black;">FALTA</span>',
            });
        }
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
    if (parsedWorkingDays === null || parsedWorkingDays === undefined) {
        return [];
    }

    let purgeDays: string[] = [];

    if (!notParsedWorkingDays.includes('FESTIVOS')) { //si no labora festivos
        festivos.forEach((item: any) => {
            let horaFormateada = dayjs.utc(item.fecha).format('ddd, DD MMM YYYY HH:mm:ss [GMT]');
            purgeDays.push(horaFormateada);
        });
    }

    attendances.forEach((item: any) => {
        purgeDays.push(item.dateReg);
    });

    let debuggedDays = parsedWorkingDays[0].filter((item: any) => !purgeDays.includes(item.dateReg));

    return attendances.concat(debuggedDays);
}

/* const horariosMafufos = [
    { matricula: 7461, hora_entrada2: '07:00:00', hora_salida2: '21:30:00' },
    { matricula: 7312, hora_entrada2: '07:30:00', hora_salida2: '22:00:00' },
    { matricula: 1798, hora_entrada2: '07:00:00', hora_salida2: '15:00:00' }
]; */

export const isComingOrOut = (hora_entrada: string, checadas: any[], employee: any) => {
    let horaEntradaLimite = dayjs(hora_entrada, "HH:mm:ss").add(2, 'hours').format('HH:mm:ss');
    let horaEntradaPermitida: string = ''; //variable en función del tipo de empleado

    if (employee.cat_tipos_empleado.nombre.includes('BASE IMSS BIENESTAR')) {
        horaEntradaPermitida = dayjs(hora_entrada, "HH:mm:ss").subtract(1, 'hour').format("HH:mm:ss"); //1 hora antes de hora de entrada
    } else { //cualquier otro empleado que no sea base imss bienestar
        horaEntradaPermitida = dayjs(hora_entrada, "HH:mm:ss").subtract(30, 'minutes').format("HH:mm:ss"); //30 minutos antes de hora de entrada
    }

    //verificar si el empleado tiene otro horario aparte del primario
    /* const arrSegundoHorario = horariosMafufos.filter((item) => item.matricula === employee.matricula); */
    let checadasClasificadas: any[] = [];

    checadas.forEach((item, index) => {
        let itemAux = { ...item };
        if (item.horaReg >= horaEntradaPermitida && item.horaReg <= horaEntradaLimite) {
            if (index === 0) {
                //VALIDAR SI LA PRIMER CHECADA TOMADA POR LA 15NA ES SALIDA
                let nextDay = dayjs(itemAux.dateReg).add(1, 'day').format('ddd, DD MMM YYYY 00:00:00 [GMT]');

                const isEntrada = checadas.find((item) => {
                    return item.dateReg === nextDay
                });

                if (isEntrada) {
                    checadasClasificadas.push({
                        ...item,
                        type: 'ENTRADA'
                    });
                } else {
                    const checadasEnUnDia = checadas.filter((item: any) => item.dateReg);
                    if (checadasEnUnDia.length > 1) {
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
                    type: 'ENTRADA'
                });
            }
        } else {
            checadasClasificadas.push({
                ...item,
                type: 'SALIDA'
            });
        }
    });

    return checadasClasificadas;
};

const IOPermisos: IOPermisosInterface = {//Obj de permisos para mapear en donde aparecen checadas. Los permisos donde no aparecen checadas son añadidos en otro proceso
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
        type: 'AMBOS'
    },
    'J91 RETARDO MENOR': {
        type: 'ENTRADA'
    },
    'SUSPENSION': {
        type: 'AMBOS'
    },
    'LACTANCIA': {
        type: 'AMBOS'
    },
    'BECA CON GOCE DE SUELDO': {
        type: 'AMBOS'
    },
    'FALTA': {
        type: 'AMBOS'
    },
    'JUST POR OFICIO': {
        type: 'AMBOS'
    },
    'LICENCIA MEDICA': {
        type: 'AMBOS'
    },
    'FESTIVOS': {
        type: 'AMBOS'
    },
    'COMISION OFICIAL': {
        type: 'AMBOS'
    }
}

export const classifyEventType = (attendances: any, vacaciones: any, permisos: any, employee: any, fec_inicio: string, fec_final: string, hora_entrada: string, hora_salida: string, parsedWorkingDays: any) => {
    let attendancesAuxWithPermissions: any[] = []; //array de incidencias a anexar a las checadas

    //VACATIONS
    vacaciones.forEach((item: any) => {
        let itemAux = { ...item } //make copy of item to treat them separately and avoid memory problems. important!!!

        while (dayjs.utc(itemAux.fecha_inicio).format('YYYY-MM-DD') <= dayjs.utc(itemAux.fecha_fin).format('YYYY-MM-DD')) {
            let horaFormateada = dayjs.utc(itemAux.fecha_inicio).format('ddd, DD MMM YYYY HH:mm:ss [GMT]');

            if (dayjs.utc(itemAux.fecha_inicio).format('YYYY-MM-DD') >= fec_inicio && dayjs.utc(itemAux.fecha_inicio).format('YYYY-MM-DD') <= fec_final) {

                if (parsedWorkingDays[1].includes(dayjs.utc(itemAux.fecha_inicio).format('dddd'))) {
                    attendancesAuxWithPermissions.push({
                        dateReg: horaFormateada,
                        horaReg: '',
                        type: 'EVENTO',
                        event: `VACACIONES ROL ${itemAux.rol}`
                    });
                }
            }

            itemAux.fecha_inicio = dayjs(itemAux.fecha_inicio).add(1, 'day').toISOString();
        }
    });

    //RETARDOS
    let horaEntradaLimite = '';
    let horaEntradaPermitida = '';
    let horaSalidaPermitida = '';
    let { nombre: tipo_empleado } = employee.cat_tipos_empleado;
    let horaEntradaMaxima = dayjs(hora_entrada, "HH:mm:ss").add(41, 'minutes').format('HH:mm:ss');
    let horaSalidaMaxima = dayjs(hora_salida, "HH:mm:ss").add(2, 'hours').format('HH:mm:ss');

    if (tipo_empleado.includes('BASE IMSS BIENESTAR')) {
        horaEntradaLimite = dayjs(hora_entrada, "HH:mm:ss").add(6, 'minutes').format('HH:mm:ss');
        horaEntradaPermitida = dayjs(hora_entrada, "HH:mm:ss").subtract(1, 'hour').format("HH:mm:ss"); //1 hora antes de hora de entrada
        horaSalidaPermitida = dayjs(hora_salida, "HH:mm:ss").format('HH:mm:ss');
    } else { //cualquier otro empleado que no sea base imss bienestar
        horaEntradaLimite = dayjs(hora_entrada, "HH:mm:ss").add(16, 'minutes').format("HH:mm:ss"); //entrada sin retardo 16 minutos despues
        horaEntradaPermitida = dayjs(hora_entrada, "HH:mm:ss").subtract(30, 'minutes').format("HH:mm:ss"); //30 minutos antes de hora de entrada
        horaSalidaPermitida = dayjs(hora_salida, "HH:mm:ss").subtract(2, 'hours').format('HH:mm:ss');
    }

    let classifiedAttendances: any = [];

    attendances.forEach((item: any) => {
        if (item.type === 'ENTRADA') {
            if (item.horaReg >= horaEntradaPermitida && item.horaReg < horaEntradaLimite) {
                classifiedAttendances.push({ ...item, event: '' });
            } else if (item.horaReg >= horaEntradaLimite && item.horaReg < horaEntradaMaxima) {
                classifiedAttendances.push({ ...item, event: 'RETARDO MENOR' });
            } else {
                classifiedAttendances.push({ ...item, event: 'OMISIÓN ENTRADA' });
            }
        } else if (item.type === 'SALIDA') {
            if (item.horaReg >= horaSalidaPermitida && item.horaReg < horaSalidaMaxima) {
                classifiedAttendances.push({ ...item, event: '' });
            }
        }
    });

    //PERMISOS
    let sharedDays: any[] = [];

    //VALIDAR QUE LOS PERMISOS APAREZCAN EN ENTRADA, SALIDA O EN DIA COMPLETO
    permisos.forEach((item: any) => {
        let itemAux = { ...item }
        while (dayjs.utc(itemAux.fecha_inicio).format('YYYY-MM-DD') <= dayjs.utc(itemAux.fecha_fin).format('YYYY-MM-DD')) {
            let horaFormateada = dayjs.utc(itemAux.fecha_inicio).format('ddd, DD MMM YYYY HH:mm:ss [GMT]');

            if (dayjs.utc(itemAux.fecha_inicio).format('YYYY-MM-DD') >= fec_inicio && dayjs.utc(itemAux.fecha_inicio).format('YYYY-MM-DD') <= fec_final) {

                if (parsedWorkingDays[1].includes(dayjs.utc(itemAux.fecha_inicio).format('dddd'))) {
                    attendancesAuxWithPermissions.push({
                        dateReg: horaFormateada,
                        horaReg: '',
                        type: 'EVENTO',
                        event: `${item.cat_permisos.nombre}`
                    });
                }
            }

            itemAux.fecha_inicio = dayjs(itemAux.fecha_inicio).add(1, 'day').toISOString();
        }
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

        // Si se encuentra un elemento coincidente, agregar el valor de 'event' dependiendo del permiso a entrada, salida o ambos
        if (!matchingItem) {
            return
        }

        const permisoType = IOPermisos[matchingItem.event]?.type;

        if (permisoType === item1.type) {
            if (item1.event === 'RETARDO MENOR' && matchingItem.event === 'AUTORIZACIÓN DE ENTRADA') {
                item1.event = matchingItem.event;
            } else {
                //si item1.event es '', 
                item1.event += item1.event ? `, ${matchingItem.event}` : matchingItem.event;
            }
        } else if (permisoType === 'AMBOS') {
            item1.event += item1.event ? `, ${matchingItem.event}` : matchingItem.event;
        }
    });

    classifiedAttendances.push(...attendancesAuxWithPermissions);

    //Eliminar checadas duplicadas de entrada y salida
    for (let index = 0; index < classifiedAttendances.length; index++) {
        if (index !== 0) {
            if ((classifiedAttendances[index].type.includes('ENTRADA') || classifiedAttendances[index].type.includes('SALIDA')) && (classifiedAttendances[index].type === classifiedAttendances[index - 1].type) && (classifiedAttendances[index].dateReg == classifiedAttendances[index - 1].dateReg)) {
                classifiedAttendances.splice(index, 1);
            }
        }
    }

    let sortedData = classifiedAttendances.sort((a: any, b: any) => new Date(a.dateReg).getTime() - new Date(b.dateReg).getTime());

    //Agregar OMISIONES DE ENTRADA Y SALIDA
    const omisionesSalida: any[] = [];
    const omisionesEntrada: any[] = [];
    const permissions = ['AUTORIZACIÓN DE ENTRADA', 'AUTORIZACIÓN DE SALIDA', 'LICENCIA MEDICA', 'SUSPENSION', 'COMISION OFICIAL'];

    //Proceso para identificar omisiones de salida
    for (let index = 0; index < sortedData.length; index++) {
        const currentItem = sortedData[index];
        const nextItem = sortedData[index + 1];

        if (index === sortedData.length - 1) {
            omisionesSalida.push(sortedData[index]);
            continue;
        }

        const shouldAddOmission = !permissions.some(item => currentItem.event.includes(item));

        if (currentItem.type === nextItem.type && shouldAddOmission) {
            if (currentItem.type === 'ENTRADA') {
                omisionesSalida.push(addOmission(currentItem));
            } else {
                omisionesSalida.push(currentItem);
            }
        } else if ((currentItem.type === 'ENTRADA' && nextItem.type === 'EVENTO') && shouldAddOmission) {
            omisionesSalida.push(addOmission(currentItem));
        } else {
            omisionesSalida.push(currentItem);
        }
    }

    //proceso para identificar omisiones de entrada
    for (let index = 0; index < omisionesSalida.length; index++) {
        const currentItem = omisionesSalida[index];

        if (index === 0) {
            omisionesEntrada.push(omisionesSalida[index]);
            continue;
        }

        if ((currentItem.type === omisionesSalida[index - 1].type) && !permissions.some(item => omisionesSalida[index].event.includes(item))) {
            if (currentItem.type === 'SALIDA') {
                omisionesEntrada.push(addOmission(currentItem));
            } else {
                omisionesEntrada.push(currentItem);
            }
        } else {
            omisionesEntrada.push(currentItem);
        }
    }

    return omisionesEntrada;
}

const addOmission = (item: any) => {
    if (item.type === 'ENTRADA' && !item.event.includes('OMISIÓN')) {
        const event = item.event !== '' ? `${item.event}, OMISIÓN DE SALIDA` : 'OMISIÓN DE SALIDA';
        return { ...item, event };
    } else if (item.type === 'SALIDA' && !item.event.includes('OMISIÓN')) {
        const event = item.event !== '' ? `${item.event}, OMISIÓN DE ENTRADA` : 'OMISIÓN DE ENTRADA';
        return { ...item, event };
    } else {
        return item;
    }
};
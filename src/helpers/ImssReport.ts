import { IOPermisosInterface, PropsHistorialHorario, PropsHorarioPerChecada } from "../interfaces/reportsQueries";
import _, { uniq } from "lodash";
import dayjs from "dayjs";
import { parse } from "path";

//REPORTE INCIDECIAS IMSS
export const generateRow = (item1: any, item2: any, index: number) => {
    const dateItem = dayjs.utc(item2['dateReg']).format('DD/MM/YYYY');
    const event = item2.event || '';

    let guards = item2.guardias.join(', ');

    return `
        <tr>
            <td>${item1.matricula}</td>
            <td>${item1.cmp_persona.nombres} ${item1.cmp_persona.primer_apellido} ${item1.cmp_persona.segundo_apellido}</td>
            <td>${item1.cat_tipos_empleado.nombre}</td>
            <td>${item1.cmp_persona.rfc}</td>
            <td>${item1.final[index].schedule}</td>
            <td style="font-size: 11px">${guards}</td>
            <td>${dateItem}</td>
            <td>${item2.type === 'ENTRADA' ? item2['horaReg'] : ''}</td>
            <td>${item2.type === 'SALIDA' ? item2['horaReg'] : ''}</td>
            <td style="width: 8%">${event}</td>
        </tr>
    `;
};

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

const getHorarioPerChecada = (historial: PropsHistorialHorario[], empleado: any, fechaChecada: string): PropsHorarioPerChecada => {
    //AGREGAR PROP SCHEDULE Y GUARDIAS PARA EL HORARIO RESPECTO AL CORTE

    if (historial.length === 0) { //si no tiene cambios de horario

        return {
            horario: dayjs.utc(empleado.hora_entrada).format('HH:mm:ss') + ' - ' + dayjs.utc(empleado.hora_salida).format('HH:mm:ss'),
            guardias: JSON.parse(decodeURIComponent(empleado.guardias))
        };
    } else {
        for (let index = 0; index < historial.length; index++) {
            if (index === historial.length - 1) {

                if (fechaChecada >= dayjs(historial[index].fecha_inicio).toISOString()) {

                    return {
                        horario: dayjs.utc(historial[index].hora_entrada).format('HH:mm:ss') + ' - ' + dayjs.utc(historial[index].hora_salida).format('HH:mm:ss'),
                        guardias: JSON.parse(decodeURIComponent(historial[index].guardias))
                    }
                } else {
                    return {
                        horario: dayjs.utc(historial[historial.length - 1].hora_entrada).format('HH:mm:ss') + ' - ' + dayjs.utc(historial[historial.length - 1].hora_salida).format('HH:mm:ss'),
                        guardias: JSON.parse(decodeURIComponent(historial[index].guardias))
                    }
                }
            } else {
                if (fechaChecada >= dayjs(historial[index].fecha_inicio).toISOString() && fechaChecada < dayjs(historial[index + 1].fecha_inicio).toISOString()) {

                    return {
                        horario: dayjs.utc(historial[index].hora_entrada).format('HH:mm:ss') + ' - ' + dayjs.utc(historial[index].hora_salida).format('HH:mm:ss'),
                        guardias: JSON.parse(decodeURIComponent(historial[index].guardias))
                    }
                }
            }
        }
    }

    //PENDIENTE VERIFICAR QUE NO HAYA BUGS CON ESTA CONDICIÓN
    return {
        horario: '',
        guardias: []
    };
}

export const parseWorkingDays = (fec_inicio: string, fec_final: string, festivos: any, empleado: any, vacaciones: any, historial: PropsHistorialHorario[]) => {

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
        schedule: string;
        guardias: string[];
    }[] = [];

    festivos.forEach((item: any) => {
        let itemAux = { ...item };
        base420Especiales.push(dayjs.utc(itemAux.fecha).add(1, 'day').format('YYYY-MM-DD'));
        base420Especiales.push(dayjs.utc(itemAux.fecha).subtract(1, 'day').format('YYYY-MM-DD'));
        festivosFormato.push(dayjs.utc(itemAux.fecha).format('YYYY-MM-DD'));
    });

    while (dayjs.utc(copy_ini).isBefore(copy_end)) {
        let fechaFormateada = dayjs(copy_ini).format('ddd, DD MMM YYYY HH:mm:ss [GMT]');
        let fechaChecada = dayjs.utc(fechaFormateada).toISOString();
        let dia = dayjs(copy_ini).format('dddd');
        let { horario, guardias } = getHorarioPerChecada(historial, empleado, fechaChecada);
        let translatedDays = translateDays(guardias);

        if (empleado.cat_turnos.nombre === 'ESPECIALES' && empleado.cat_tipos_empleado.nombre === 'BASE 420') {
            if (!base420Especiales.includes(dayjs(copy_ini).format('YYYY-MM-DD'))) {//SI LA FECHA NO SE ENCUENTRA UN DIA ANTES O DESPUES DE ALGUN DIA FESTIVO
                parsedDays.push({
                    dateReg: fechaFormateada,
                    day: dia,
                    horaReg: '',
                    type: 'EVENTO',
                    event: '<span style="color: black;">FALTA</span>',
                    schedule: horario,
                    guardias
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
                        event: '<span style="color: black;">FALTA</span>',
                        schedule: horario,
                        guardias
                    });
                }
            } else {
                if (translatedDays.includes(dia)) { // si labora el dia
                    parsedDays.push({
                        dateReg: fechaFormateada,
                        day: dia,
                        horaReg: '',
                        type: 'EVENTO',
                        event: '<span style="color: black;">FALTA</span>',
                        schedule: horario,
                        guardias
                    });
                }
            }
        }
        copy_ini = dayjs(copy_ini).add(1, 'day').format('YYYY-MM-DD');
    }

    festivos.forEach((item1: any) => {
        let fechaFormateada = dayjs.utc(item1.fecha).format('ddd, DD MMM YYYY HH:mm:ss [GMT]');
        let fechaChecada = dayjs.utc(fechaFormateada).toISOString();
        let { horario, guardias } = getHorarioPerChecada(historial, empleado, fechaChecada);

        if (guardias.includes('FESTIVOS')) {//PARA AQUELLOS QUE LABORAN FESTIVOS
            if (vacaciones.length === 0) {
                return
            }

            //PENDIENTE OBSERVAR SI ESTA CONDICION SE CUMPLE EN CORTES DE HORARIO
            if (!(item1.fecha >= vacaciones[0].fecha_inicio && item1.fecha <= vacaciones[0].fecha_fin)) { //ELIMINA 'FALTA' EN AQUELLOS CASOS DONDE ESTAN DE VACACIONES Y SE ATRAVIESA UN FESTIVO
                parsedDays.push({
                    dateReg: fechaFormateada,
                    type: 'EVENTO FESTIVO',
                    event: '<span style="color: black;">FALTA</span>',
                    schedule: horario,
                    guardias
                });
            }
        } else { // SINO LABORAN FESTIVOS
            parsedDays.push({
                dateReg: fechaFormateada,
                type: 'EVENTO FESTIVO',
                event: '<span style="color: black;">FALTA</span>',
                schedule: horario,
                guardias
            });
        }
    });

    historial.forEach((item: PropsHistorialHorario) => {
        const translatedDays = translateDays(JSON.parse(decodeURIComponent(item.guardias)));

        if (item.guardias.includes('FESTIVOS')) {
            let attendances: any = parsedDays.filter((item) => (translatedDays.includes(item.day) || item.type === 'EVENTO FESTIVO'));

            debuggedWorkingDays.push(attendances);
        } else {
            let attendances: any = parsedDays.filter((item) => translatedDays.includes(item.day));

            debuggedWorkingDays.push(attendances);
        }
    });

    //combinar los array respecto a los cambios de horario y depurar por dateReg para quedarnos con registros únicos
    const combined = debuggedWorkingDays.flat();

    // Eliminar duplicados por dateReg
    const uniqueWorkingDays = Array.from(
        new Map(combined.map(item => [item.dateReg, item])).values()
    );

    return uniqueWorkingDays;
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

    let debuggedDays = parsedWorkingDays.filter((item: any) => !purgeDays.includes(item.dateReg));

    return attendances.concat(debuggedDays);
}

/* const horariosMafufos = [
    { matricula: 7461, hora_entrada2: '07:00:00', hora_salida2: '21:30:00' },
    { matricula: 7312, hora_entrada2: '07:30:00', hora_salida2: '22:00:00' },
    { matricula: 1798, hora_entrada2: '07:00:00', hora_salida2: '15:00:00' }
]; */

export const horaEntradaPerTipoEmpleado = (tipo_empleado: number, hora_entrada: string) => {
    if (tipo_empleado === 17 || tipo_empleado === 19) { //Base IMSS Bienestar y contrato eventual imss bienestar
        return dayjs.utc(hora_entrada).subtract(1, 'hour').format("HH:mm:ss"); //1 hora antes de hora de entrada
    } else { //cualquier otro empleado que no sea base imss bienestar
        return dayjs.utc(hora_entrada).subtract(30, 'minutes').format("HH:mm:ss"); //30 minutos antes de hora de entrada
    }
}

export const isComingOrOut = (hora_entrada: string, checadas: any[], employee: any, historial: PropsHistorialHorario[]) => {
    let horaEntradaLimite: string = '';
    let horaEntradaPermitida: string = ''; //variable en función del tipo de empleado

    //verificar si el empleado tiene otro horario aparte del primario
    /* const arrSegundoHorario = horariosMafufos.filter((item) => item.matricula === employee.matricula); */
    let checadasClasificadas: any[] = [];

    checadas.forEach((item, index) => {
        let itemAux = { ...item };
        let fechaChecada = dayjs(itemAux.dateReg).toISOString();
        let schedule = '';
        let guards: string[] = [];

        //ajustar los horarios respecto a los cortes si existen    
        if (historial.length === 0) { //si no tiene cambios de horario
            horaEntradaLimite = dayjs(hora_entrada, "HH:mm:ss").add(3, 'hours').format('HH:mm:ss');

            schedule = dayjs.utc(employee.hora_entrada).format('HH:mm:ss') + ' - ' + dayjs.utc(employee.hora_salida).format('HH:mm:ss');

            guards = JSON.parse(decodeURIComponent(employee.guardias));

            horaEntradaPermitida = horaEntradaPerTipoEmpleado(employee.cat_tipos_empleado.id, hora_entrada);
        } else {
            for (let index = 0; index < historial.length; index++) {
                if (index === historial.length - 1) {
                    if (fechaChecada >= dayjs(historial[index].fecha_inicio).toISOString()) {
                        horaEntradaLimite = dayjs.utc(historial[index].hora_entrada).add(3, 'hours').format('HH:mm:ss');

                        schedule = dayjs.utc(historial[index].hora_entrada).format('HH:mm:ss') + ' - ' + dayjs.utc(historial[index].hora_salida).format('HH:mm:ss');

                        guards = JSON.parse(decodeURIComponent(historial[index].guardias));

                        horaEntradaPermitida = horaEntradaPerTipoEmpleado(employee.cat_tipos_empleado.id, historial[index].hora_entrada);
                    }
                } else {
                    if (fechaChecada >= dayjs(historial[index].fecha_inicio).toISOString() && fechaChecada < dayjs(historial[index + 1].fecha_inicio).toISOString()) {
                        /* console.log(item, fechaChecada, dayjs(historial[index].fecha_inicio).toISOString(), historial); */
                        horaEntradaLimite = dayjs.utc(historial[index].hora_entrada).add(3, 'hours').format('HH:mm:ss');

                        schedule = dayjs.utc(historial[index].hora_entrada).format('HH:mm:ss') + ' - ' + dayjs.utc(historial[index].hora_salida).format('HH:mm:ss');

                        guards = JSON.parse(decodeURIComponent(historial[index].guardias));

                        horaEntradaPermitida = horaEntradaPerTipoEmpleado(employee.cat_tipos_empleado.id, historial[index].hora_entrada);
                    }
                }
            }
        }

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
                        type: 'ENTRADA',
                        schedule,
                        guardias: guards
                    });
                } else {
                    const checadasEnUnDia = checadas.filter((item: any) => item.dateReg);
                    if (checadasEnUnDia.length > 1) {
                        checadasClasificadas.push({
                            ...item,
                            type: 'ENTRADA',
                            schedule,
                            guardias: guards
                        });
                    } else {
                        checadasClasificadas.push({
                            ...item,
                            type: 'SALIDA',
                            schedule,
                            guardias: guards
                        });
                    }
                }
            } else {
                checadasClasificadas.push({
                    ...item,
                    type: 'ENTRADA',
                    schedule,
                    guardias: guards
                });
            }
        } else {
            checadasClasificadas.push({
                ...item,
                type: 'SALIDA',
                schedule,
                guardias: guards
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
    },
    'PERMANENCIA CONSULTA MÉDICA': {
        type: 'AMBOS'
    },
    'JUST CAM': {
        type: 'AMBOS'
    },
    'PASE DE ENTRADA POR HORAS FESTIVAS': {
        type: 'ENTRADA'
    },
    'PASE DE SALIDA POR HORAS FESTIVAS': {
        type: 'SALIDA'
    }
}

export const classifyEventType = (attendances: any, vacaciones: any, permisos: any, employee: any, fec_inicio: string, fec_final: string, historial: PropsHistorialHorario[]) => {
    let attendancesAuxWithPermissions: any[] = []; //array de incidencias a anexar a las checadas

    //VACATIONS
    vacaciones.forEach((item: any) => {
        let itemAux = { ...item } //make copy of item to treat them separately and avoid memory problems. important!!!
        let fechaAEvaluarHorario = dayjs.utc(itemAux.fecha_inicio).toISOString();
        let { horario, guardias } = getHorarioPerChecada(historial, employee, fechaAEvaluarHorario);
        const translatedDays = translateDays(guardias);

        while (dayjs.utc(itemAux.fecha_inicio).format('YYYY-MM-DD') <= dayjs.utc(itemAux.fecha_fin).format('YYYY-MM-DD')) {
            let horaFormateada = dayjs.utc(itemAux.fecha_inicio).format('ddd, DD MMM YYYY HH:mm:ss [GMT]');

            if (dayjs.utc(itemAux.fecha_inicio).format('YYYY-MM-DD') >= fec_inicio && dayjs.utc(itemAux.fecha_inicio).format('YYYY-MM-DD') <= fec_final) {

                if (translatedDays.includes(dayjs.utc(itemAux.fecha_inicio).format('dddd'))) {
                    attendancesAuxWithPermissions.push({
                        dateReg: horaFormateada,
                        horaReg: '',
                        type: 'EVENTO',
                        event: `VACACIONES ROL ${itemAux.rol}`,
                        schedule: horario,
                        guardias
                    });
                }
            }

            itemAux.fecha_inicio = dayjs(itemAux.fecha_inicio).add(1, 'day').toISOString();
        }
    });

    //RETARDOS
    let horaEntradaLimite = '';
    let horaEntradaPermitida = '';
    let horaSalidaMaxima = '';
    let horaSalidaPermitida = '';
    let { id: id_tipo_empleado } = employee.cat_tipos_empleado;

    let classifiedAttendances: any = [];
    let checadasSinHorariosVacios = attendances.filter((item: any) => item.schedule != '');

    checadasSinHorariosVacios.forEach((item: any) => {
        let horaEntrada = item.schedule.split('-')[0].trim();
        let horaSalida = item.schedule.split('-')[1].trim();
        let horaEntradaMaxima = dayjs(horaEntrada, "HH:mm:ss").add(41, 'minutes').format('HH:mm:ss');

        //Definir rango variable de horas máximas de salida
        if (horaSalida === '23:00:00') {
            horaSalidaMaxima = dayjs(horaSalida, "HH:mm:ss").add(59, 'minutes').format('HH:mm:ss');
        } else if (horaSalida === '22:30:00') {
            horaSalidaMaxima = dayjs(horaSalida, "HH:mm:ss").add(1, 'hour').add(29, 'minutes').format('HH:mm:ss');
        } else if (horaSalida === '22:00:00') {
            horaSalidaMaxima = dayjs(horaSalida, "HH:mm:ss").add(1, 'hour').add(59, 'minutes').format('HH:mm:ss');
        } else if (horaSalida === '21:30:00') {
            horaSalidaMaxima = dayjs(horaSalida, "HH:mm:ss").add(2, 'hour').add(29, 'minutes').format('HH:mm:ss');
        } else {
            horaSalidaMaxima = dayjs(horaSalida, "HH:mm:ss").add(2, 'hour').add(59, 'minutes').format('HH:mm:ss');
        }

        //Definir rango variable de hora de salida permitida
        if (horaSalida === '01:00:00') {
            horaSalidaPermitida = dayjs(horaSalida, "HH:mm:ss").subtract(1, 'hour').format('HH:mm:ss');
        } else {
            horaSalidaPermitida = dayjs(horaSalida, "HH:mm:ss").subtract(2, 'hours').format('HH:mm:ss');
        }

        if (id_tipo_empleado === 17 || id_tipo_empleado === 19) { //Base IMSS Bienestar
            horaEntradaLimite = dayjs(horaEntrada, "HH:mm:ss").add(6, 'minutes').format('HH:mm:ss');
            horaEntradaPermitida = dayjs(horaEntrada, "HH:mm:ss").subtract(1, 'hour').format("HH:mm:ss"); //1 hora antes de hora de entrada
        } else { //cualquier otro empleado que no sea base imss bienestar
            horaEntradaLimite = dayjs(horaEntrada, "HH:mm:ss").add(16, 'minutes').format("HH:mm:ss"); //entrada sin retardo 16 minutos despues
            horaEntradaPermitida = dayjs(horaEntrada, "HH:mm:ss").subtract(30, 'minutes').format("HH:mm:ss"); //30 minutos antes de hora de entrada
        }

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
        let fechaAEvaluarHorario = dayjs.utc(itemAux.fecha_inicio).toISOString();
        let { horario, guardias } = getHorarioPerChecada(historial, employee, fechaAEvaluarHorario);
        const translatedDays = translateDays(guardias);

        while (dayjs.utc(itemAux.fecha_inicio).format('YYYY-MM-DD') <= dayjs.utc(itemAux.fecha_fin).format('YYYY-MM-DD')) {
            let horaFormateada = dayjs.utc(itemAux.fecha_inicio).format('ddd, DD MMM YYYY HH:mm:ss [GMT]');

            if (dayjs.utc(itemAux.fecha_inicio).format('YYYY-MM-DD') >= fec_inicio && dayjs.utc(itemAux.fecha_inicio).format('YYYY-MM-DD') <= fec_final) {

                if (translatedDays.includes(dayjs.utc(itemAux.fecha_inicio).format('dddd'))) {
                    attendancesAuxWithPermissions.push({
                        dateReg: horaFormateada,
                        horaReg: '',
                        type: 'EVENTO',
                        event: `${item.cat_permisos.nombre}`,
                        schedule: horario,
                        guardias
                    });
                }
            }

            itemAux.fecha_inicio = dayjs(itemAux.fecha_inicio).add(1, 'day').toISOString();
        }
    });

    //proceso para evitar entradas duplicadas en registros con permisos sin checadas
    classifiedAttendances.forEach((item1: any) => {
        //Obtener de los permisos aquellos que aparecen en dias con checadas
        attendancesAuxWithPermissions.forEach((item2: any, index: number) => {
            if (item1.dateReg !== item2.dateReg) return;

            if (item2.event.includes('VACACIONES')) {
                item1.event === '' ? item1.event += item2.event : item1.event += ', ' + item2.event
            }

            attendancesAuxWithPermissions.splice(index, 1); //Quitamos el permiso que corresponde al dia para no repetir la entrada en el push(...)
            sharedDays.push(item2);
        });
    });

    classifiedAttendances.forEach((item1: any) => {
        // Buscar si la fecha de item1 coincide con alguna en array2
        const matchingItem = sharedDays.find(item2 => item2.dateReg === item1.dateReg);

        // Si se encuentra un elemento coincidente, agregar el valor de 'event' dependiendo del permiso a entrada, salida o ambos
        if (!matchingItem) return;

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
    const permissions = ['AUTORIZACIÓN DE ENTRADA', 'AUTORIZACIÓN DE SALIDA', 'LICENCIA MEDICA', 'SUSPENSION', 'COMISION OFICIAL', 'PERMANENCIA CONSULTA MÉDICA', 'JUST CAM', 'JUST POR OFICIO', 'PASE DE ENTRADA POR HORAS FESTIVAS', 'PASE DE SALIDA POR HORAS FESTIVAS'];
    
    //Proceso para identificar omisiones de salida
    for (let index = 0; index < sortedData.length; index++) {
        const currentItem = sortedData[index];
        const nextItem = sortedData[index + 1];

        //PERMISOS QUE SI ESTÁN CAPTURADOS ANULAN (JUSTIFICAN) LAS OMISIONES
        const shouldAddOmission = !permissions.some(item => currentItem.event.includes(item));

        if (index === sortedData.length - 1) {
            if (sortedData[index].type === 'ENTRADA' && shouldAddOmission) { //Ultimo item del arreglo no puede ser entrada, es Omisión Salida
                omisionesSalida.push(addOmission(sortedData[index]))
            } else {
                omisionesSalida.push(sortedData[index]);
            }

            continue;
        }

        if (currentItem.type === nextItem.type && shouldAddOmission) {
            if (currentItem.type === 'ENTRADA') {
                omisionesSalida.push(addOmission(currentItem));
            } else {
                omisionesSalida.push(currentItem);
            }
        } else if ((currentItem.type === 'ENTRADA' && nextItem.type === 'EVENTO') && shouldAddOmission) {
            omisionesSalida.push(addOmission(currentItem));
        } else {
            omisionesSalida.push(checadaEmpleadoRegularIrregular(sortedData, currentItem, employee, shouldAddOmission));
        }
    }

    //proceso para identificar omisiones de entrada
    for (let index = 0; index < omisionesSalida.length; index++) {
        const currentItem = omisionesSalida[index];

        //PERMISOS QUE SI ESTÁN CAPTURADOS ANULAN (JUSTIFICAN) LAS OMISIONES
        const shouldAddOmission = !permissions.some(item => currentItem.event.includes(item));

        if (index === 0) {
            omisionesEntrada.push(omisionesSalida[index]);
            continue;
        }

        if ((currentItem.type === omisionesSalida[index - 1].type) && shouldAddOmission) {
            if (currentItem.type === 'SALIDA') {
                omisionesEntrada.push(addOmission(currentItem));
            } else {
                omisionesEntrada.push(currentItem);
            }
        } else {
            omisionesEntrada.push(checadaEmpleadoRegularIrregular(sortedData, currentItem, employee, shouldAddOmission));
        }
    }

    return omisionesEntrada;
}

const checadaEmpleadoRegularIrregular = (sortedData: any, currentItem: any, employee: any, shouldAddOmission: any) => { // Regular -> Checa ES en un día, Irregular -> Checa E en un día y S en otro
    //CONDICIONAL PARA EMPLEADOS DONDE CHECAN ENTRADA Y SALIDA EN UN MISMO DIA
    if (employee.cat_turnos.nombre === 'MATUTINO' && shouldAddOmission) {
        const checadasDelDia = sortedData.filter((item: any) => item.dateReg === currentItem.dateReg);
        // UN DIA COMPLETO TIENE QUE TENER 2 CHECADAS, SI TIENE 1 ES OMISIÓN

        if (checadasDelDia.length === 1) {
            return addOmission(currentItem);
        } else {
            return currentItem;
        }
    } else {
        return currentItem;
    }

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

//HISTORIAL HORARIOS
const getCortesRecientesHistorial = (cortes: any) => {
    const resultado = new Map();

    for (const corte of cortes) {
        const fecha = new Date(corte.fecha_inicio).toISOString();
        resultado.set(fecha, corte); // Reemplaza si ya existe esa fecha, garantizando que solo se mantenga el más reciente
    }

    return Array.from(resultado.values());
}

export const getEmployeeDataPerDateRange = (historial_horario: PropsHistorialHorario[], fecha_ini: string, fecha_fin: string, hora_entrada: string, hora_salida: string, employee: any) => {

    let parseHora_entrada = dayjs.utc(hora_entrada).format('HH:mm:ss');
    let parseHora_salida = dayjs.utc(hora_salida).format('HH:mm:ss');
    let guardiasAux: string[] = JSON.parse(decodeURIComponent(employee.guardias));

    //eliminar cortes duplicados por mismo día y quedarnos con el útlimo de ese día
    let uniqueHorarios: PropsHistorialHorario[] = getCortesRecientesHistorial(historial_horario);

    if (historial_horario.length === 0) { //si al empleado no le han cambiado el horario

        //regresa los datos actuales de la tabla rch_empleados

        return {
            historial: [{
                fecha_inicio: dayjs.utc(fecha_ini).toISOString(),
                hora_entrada: dayjs.utc(hora_entrada).toISOString(),
                hora_salida: dayjs.utc(hora_salida).toISOString(),
                guardias: employee.guardias
            }],
            horario_actual: {
                hora_entrada: parseHora_entrada,
                hora_salida: parseHora_salida,
                guardias: guardiasAux
            }
        }
    } else { // si ya tiene cambios de horario

        //obtenemos el o los horarios capturados en el rango de fechas del reporte
        let filteredHistorial: PropsHistorialHorario[] = uniqueHorarios.filter((item: PropsHistorialHorario) => {
            const fecha = dayjs.utc(item.fecha_inicio).format('YYYY-MM-DD');
            return fecha >= fecha_ini && fecha <= fecha_fin;
        });

        if (filteredHistorial.length === 0) { //si no hay cambios de horario en el rango de fechas regresa los datos del último cambio de horario

            return {
                historial: [{
                    fecha_inicio: dayjs.utc(fecha_ini).toISOString(),
                    hora_entrada: dayjs.utc(hora_entrada).toISOString(),
                    hora_salida: dayjs.utc(hora_salida).toISOString(),
                    guardias: uniqueHorarios[uniqueHorarios.length - 1].guardias
                }],
                horario_actual: {
                    hora_entrada: dayjs.utc(uniqueHorarios[uniqueHorarios.length - 1].hora_entrada).format('HH:mm:ss'),
                    hora_salida: dayjs.utc(uniqueHorarios[uniqueHorarios.length - 1].hora_salida).format('HH:mm:ss'),
                    guardias: JSON.parse(decodeURIComponent(uniqueHorarios[uniqueHorarios.length - 1].guardias))
                }
            }
        } else {//si hay cambios de horario en el rango de fechas regresa todos los horarios diferentes capturados en el rango de fechas

            //restaurar la fecha original de inicio, puesto que se le resta 1 dia para el procesamiento de las checadas
            const ogFechaIni = dayjs(fecha_ini).add(1, 'day').format('YYYY-MM-DD');

            //si el primer horario coincidente es mayor a la fecha de inicio entonces agregamos al indice 0 un horario admisible anterior (que no tenga guardias vacias)
            if (dayjs.utc(filteredHistorial[0].fecha_inicio).format('YYYY-MM-DD') > ogFechaIni) {

                let restCounter = 1;

                while ((uniqueHorarios.indexOf(filteredHistorial[0]) - restCounter) >= 0) {
                    if (uniqueHorarios[uniqueHorarios.indexOf(filteredHistorial[0]) - restCounter].guardias !== '[]') {
                        filteredHistorial.unshift(uniqueHorarios[uniqueHorarios.indexOf(filteredHistorial[0]) - restCounter]);
                        break;
                    }

                    restCounter += 1;
                }

            }

            return {
                historial: filteredHistorial,
                horario_actual: {
                    hora_entrada: dayjs.utc(filteredHistorial[0].hora_entrada).format('HH:mm:ss'),
                    hora_salida: dayjs.utc(filteredHistorial[0].hora_salida).format('HH:mm:ss'),
                    guardias: JSON.parse(decodeURIComponent(filteredHistorial[0].guardias))
                }
            }
        }
    }
}
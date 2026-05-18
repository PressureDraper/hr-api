import { IOPermisosInterface, PropsAttendances, PropsChecadasCentralizadas, PropsChecadasEstrategias, PropsEstrategiasSuplente, PropsHistorialHorario, PropsHorarioPerChecada } from "../interfaces/reportsQueries";
import _, { uniq } from "lodash";
import dayjs from "dayjs";
import { parse } from "path";
import { getEmployeeShiftQuery } from "./employeesQueries";
import { getAttendancesReport } from "./reportsQueries";

//REPORTE INCIDECIAS IMSS
export const generateRow = (item1: any, item2: any, index: number) => {
    const dateItem = dayjs.utc(item2['dateReg']).format('DD/MM/YYYY');
    const event = item2.event || '';

    return `
        <tr>
            <td>${item1.matricula}</td>
            <td>${dateItem}</td>
            <td>${item2.type === 'ENTRADA' ? item2['horaReg'] : ''}</td>
            <td>${item2.type === 'SALIDA' ? item2['horaReg'] : ''}</td>
            <td style="width: 8%">${event}</td>
        </tr>
    `;
};

export const getUnrepeatedAttendances = (attendances: any[]) => {
    // Agrupar los elementos por la fecha (sin la hora)
    const groupedByDate = _.groupBy(attendances, (item) => new Date(item.dateReg).toDateString());

    // Obtener la primer checada de cada hora dentro de cada grupo de fecha
    const result = _.flatMap(groupedByDate, (items) => {
        return _.uniqBy(items, (item) => item.horaReg.split(':')[0]); // Filtrar por hora única
    });

    return result
}

export const getAttendancesPerPermissionDateRange = (attendances: any[], fec_ini: string, fec_fin: string, ini_horario_suplente: string, fin_horario_suplente: string, guardias_titular: string) => {
    // Filtrar checadas para quedarnos con las que se encuentren capturadas en el rango de la estrategia
    const entradaMinimaPermitida = dayjs.utc(ini_horario_suplente).subtract(1, 'hour').format('HH:mm:ss');
    const entradaMaximaPermitida = dayjs.utc(ini_horario_suplente).add(40, 'minutes').format('HH:mm:ss');
    const salidaMinimaPermitida = dayjs.utc(fin_horario_suplente).subtract(2, 'hours').format('HH:mm:ss');
    const salidaMaximaPermitida = dayjs.utc(fin_horario_suplente).add(2, 'hours').format('HH:mm:ss');
    const fec_salida = dayjs.utc(fec_ini).add(1, 'day').toISOString();
    const guardias = guardias_titular ? JSON.parse(decodeURIComponent(guardias_titular)) : [];
    let strategyAttendances: any[] = [];

    //Proceso para empleados que checan entrada en un dia y salida al siguiente
    if (guardias.length <= 3) {
        strategyAttendances = attendances.filter((item) => {
            const horaChecada = dayjs.utc(item.horaReg, 'HH:mm:ss').format('HH:mm:ss');
            const fechaChecada = dayjs.utc(item.dateReg).toISOString();
            const isEntranceAttendance = fechaChecada >= dayjs.utc(fec_ini).toISOString() && fechaChecada <= dayjs.utc(fec_fin).toISOString() && horaChecada >= entradaMinimaPermitida && horaChecada <= entradaMaximaPermitida;
            const isOutAttendance = fechaChecada >= fec_salida && fechaChecada <= fec_salida && horaChecada >= salidaMinimaPermitida && horaChecada <= salidaMaximaPermitida;

            if (isEntranceAttendance || isOutAttendance) {
                return item;
            }
        });
    } else {
        strategyAttendances = attendances.filter((item) => dayjs.utc(item.dateReg).toISOString() >= dayjs.utc(fec_ini).toISOString() && dayjs.utc(item.dateReg).toISOString() <= dayjs.utc(fec_fin).toISOString());
    }

    return strategyAttendances;
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
                        guardias: historial[index].guardias === 'null' ? JSON.parse(decodeURIComponent(empleado.guardias)) : JSON.parse(decodeURIComponent(historial[index].guardias))
                    }
                } else {
                    return {
                        horario: dayjs.utc(historial[historial.length - 1].hora_entrada).format('HH:mm:ss') + ' - ' + dayjs.utc(historial[historial.length - 1].hora_salida).format('HH:mm:ss'),
                        guardias: historial[index].guardias === 'null' ? JSON.parse(decodeURIComponent(empleado.guardias)) : JSON.parse(decodeURIComponent(historial[index].guardias))
                    }
                }
            } else {
                if (fechaChecada >= dayjs(historial[index].fecha_inicio).toISOString() && fechaChecada < dayjs(historial[index + 1].fecha_inicio).toISOString()) {

                    return {
                        horario: dayjs.utc(historial[index].hora_entrada).format('HH:mm:ss') + ' - ' + dayjs.utc(historial[index].hora_salida).format('HH:mm:ss'),
                        guardias: historial[index].guardias === 'null' ? JSON.parse(decodeURIComponent(empleado.guardias)) : JSON.parse(decodeURIComponent(historial[index].guardias))
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
                    event: '<span style="color: black; font-size: 11px;">FALTA</span>',
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
                        event: '<span style="color: black; font-size: 11px;">FALTA</span>',
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
                        event: '<span style="color: black; font-size: 11px;">FALTA</span>',
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
                    event: '<span style="color: black; font-size: 11px;">FALTA</span>',
                    schedule: horario,
                    guardias
                });
            }
        } else { // SINO LABORAN FESTIVOS
            parsedDays.push({
                dateReg: fechaFormateada,
                type: 'EVENTO FESTIVO',
                event: '<span style="color: black; font-size: 11px;">FALTA</span>',
                schedule: horario,
                guardias
            });
        }
    });

    historial.forEach((item: PropsHistorialHorario) => {
        const guardias = item.guardias === 'null' ? JSON.parse(decodeURIComponent(empleado.guardias)) : JSON.parse(decodeURIComponent(item.guardias));

        const translatedDays = translateDays(guardias);

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

export const horaEntradaPerTipoEmpleado = (tipo_empleado: number, hora_entrada: string) => {
    if (tipo_empleado === 17 || tipo_empleado === 19) { //Base IMSS Bienestar y contrato eventual imss bienestar
        return dayjs.utc(hora_entrada).subtract(1, 'hour').format("HH:mm:ss"); //1 hora antes de hora de entrada
    } else { //cualquier otro empleado que no sea base imss bienestar
        return dayjs.utc(hora_entrada).subtract(30, 'minutes').format("HH:mm:ss"); //30 minutos antes de hora de entrada
    }
}

export const isComingOrOut = (hora_entrada: string, checadas: PropsChecadasCentralizadas[], employee: any, historial: PropsHistorialHorario[], checadasSuplente: PropsChecadasEstrategias[]) => { /* estrategiasHorariosTitular: any[] */
    let horaEntradaLimite: string = '';
    let horaEntradaPermitida: string = ''; //variable en función del tipo de empleado
    let checadasClasificadas: any[] = [];
    let checadasOrdenadas = checadas;

    if (checadasSuplente.length > 0) {
        //Si hay checadas de suplente, las agregamos al array de checadas
        checadasSuplente.forEach((_item, index) => {
            checadas = checadas.concat(checadasSuplente[index].data);
        });
        checadasOrdenadas = checadas.sort((a: any, b: any) => new Date(a.dateReg).getTime() - new Date(b.dateReg).getTime());
    }

    //Procesar checadas del empleado
    checadasOrdenadas.forEach((item, index) => {
        let itemAux = { ...item };
        let fechaChecada = dayjs(itemAux.dateReg).toISOString();
        let schedule = '';
        let guards: string[] = [];
        let labelEstrategia = '';

        //ajustar los horarios respecto a los cortes si existen    
        if (historial.length === 0) { //si no tiene cambios de horario
            //si para estrategias al titular no le cambiaron el horario, se respeta su horario original
            if (!item.ini_horario_titular) {
                horaEntradaLimite = dayjs.utc(hora_entrada, "HH:mm:ss").add(3, 'hours').format('HH:mm:ss');
                schedule = dayjs.utc(employee.hora_entrada).format('HH:mm:ss') + ' - ' + dayjs.utc(employee.hora_salida).format('HH:mm:ss');
            } else { //si le cambiaron el horario, se respeta el horario de la estrategia
                horaEntradaLimite = dayjs.utc(item.ini_horario_titular).add(3, 'hours').format('HH:mm:ss');
                schedule = dayjs.utc(item.ini_horario_titular).format('HH:mm:ss') + ' - ' + dayjs.utc(item.fin_horario_titular).format('HH:mm:ss');
            }

            guards = JSON.parse(decodeURIComponent(employee.guardias));

            horaEntradaPermitida = horaEntradaPerTipoEmpleado(employee.cat_tipos_empleado.id, hora_entrada);
        } else {
            for (let index = 0; index < historial.length; index++) {
                if (index === historial.length - 1) {
                    if (fechaChecada >= dayjs(historial[index].fecha_inicio).toISOString()) {
                        //si para estrategias al titular no le cambiaron el horario, se respeta su horario original
                        if (!item.ini_horario_titular) {
                            horaEntradaLimite = dayjs.utc(historial[index].hora_entrada).add(3, 'hours').format('HH:mm:ss');
                            schedule = dayjs.utc(historial[index].hora_entrada).format('HH:mm:ss') + ' - ' + dayjs.utc(historial[index].hora_salida).format('HH:mm:ss');
                            horaEntradaPermitida = horaEntradaPerTipoEmpleado(employee.cat_tipos_empleado.id, historial[index].hora_entrada);
                        } else { //si le cambiaron el horario, se respeta el horario de la estrategia
                            horaEntradaLimite = dayjs.utc(item.ini_horario_titular).add(3, 'hours').format('HH:mm:ss');
                            schedule = dayjs.utc(item.ini_horario_titular).format('HH:mm:ss') + ' - ' + dayjs.utc(item.fin_horario_titular).format('HH:mm:ss');
                            horaEntradaPermitida = horaEntradaPerTipoEmpleado(employee.cat_tipos_empleado.id, item.ini_horario_titular);
                        }

                        guards = historial[index].guardias === 'null' ? JSON.parse(decodeURIComponent(employee.guardias)) : JSON.parse(decodeURIComponent(historial[index].guardias));
                    }
                } else {
                    if (fechaChecada >= dayjs(historial[index].fecha_inicio).toISOString() && fechaChecada < dayjs(historial[index + 1].fecha_inicio).toISOString()) {
                        //si para estrategias al titular no le cambiaron el horario, se respeta su horario original
                        if (!item.ini_horario_titular) {
                            horaEntradaLimite = dayjs.utc(historial[index].hora_entrada).add(3, 'hours').format('HH:mm:ss');
                            schedule = dayjs.utc(historial[index].hora_entrada).format('HH:mm:ss') + ' - ' + dayjs.utc(historial[index].hora_salida).format('HH:mm:ss');
                            horaEntradaPermitida = horaEntradaPerTipoEmpleado(employee.cat_tipos_empleado.id, historial[index].hora_entrada);
                        } else {  //si le cambiaron el horario, se respeta el horario de la estrategia
                            horaEntradaLimite = dayjs.utc(item.ini_horario_titular).add(3, 'hours').format('HH:mm:ss');
                            schedule = dayjs.utc(item.ini_horario_titular).format('HH:mm:ss') + ' - ' + dayjs.utc(item.fin_horario_titular).format('HH:mm:ss');
                            horaEntradaPermitida = horaEntradaPerTipoEmpleado(employee.cat_tipos_empleado.id, item.ini_horario_titular);
                        }

                        guards = historial[index].guardias === 'null' ? JSON.parse(decodeURIComponent(employee.guardias)) : JSON.parse(decodeURIComponent(historial[index].guardias));
                    }
                }
            }
        }

        //mapeo de las checadas de estrategias como suplente con horario diferente al del empleado en cuestión
        // for (let index = 0; index < estrategiasHorariosTitular.length; index++) {
        //     if (dayjs.utc(estrategiasHorariosTitular[index].fecha).format('YYYY-MM-DD') === dayjs.utc(item.dateReg).format('YYYY-MM-DD') /* || (estrategiasHorariosTitular[index].guardias.length <= 3 && dayjs.utc(estrategiasHorariosTitular[index].fecha).add(1, 'day').format('YYYY-MM-DD') === dayjs.utc(item.dateReg).format('YYYY-MM-DD')) */) {
        //         horaEntradaLimite = dayjs.utc(estrategiasHorariosTitular[index].hora_entrada, "HH:mm:ss").add(3, 'hours').format('HH:mm:ss');
        //         schedule = estrategiasHorariosTitular[index].hora_entrada + ' - ' + estrategiasHorariosTitular[index].hora_salida;
        //         horaEntradaPermitida = dayjs.utc(estrategiasHorariosTitular[index].hora_entrada, "HH:mm:ss").subtract(1, 'hour').format("HH:mm:ss");
        //         guards = estrategiasHorariosTitular[index].guardias;
        //         labelEstrategia = estrategiasHorariosTitular[index].label;
        //     }
        // }

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
                        guardias: guards,
                        label: item.label ? item.label : labelEstrategia,
                        ini_horario_titular: item.ini_horario_titular ? item.ini_horario_titular : '',
                        fin_horario_titular: item.fin_horario_titular ? item.fin_horario_titular : ''
                    });
                } else {
                    const checadasEnUnDia = checadas.filter((item) => item.dateReg);
                    if (checadasEnUnDia.length > 1) {
                        checadasClasificadas.push({
                            ...item,
                            type: 'ENTRADA',
                            schedule,
                            guardias: guards,
                            label: item.label ? item.label : labelEstrategia,
                            ini_horario_titular: item.ini_horario_titular ? item.ini_horario_titular : '',
                            fin_horario_titular: item.fin_horario_titular ? item.fin_horario_titular : ''
                        });
                    } else {
                        checadasClasificadas.push({
                            ...item,
                            type: 'SALIDA',
                            schedule,
                            guardias: guards,
                            label: item.label ? item.label : labelEstrategia,
                            ini_horario_titular: item.ini_horario_titular ? item.ini_horario_titular : '',
                            fin_horario_titular: item.fin_horario_titular ? item.fin_horario_titular : ''
                        });
                    }
                }
            } else {
                checadasClasificadas.push({
                    ...item,
                    type: 'ENTRADA',
                    schedule,
                    guardias: guards,
                    label: item.label ? item.label : labelEstrategia,
                    ini_horario_titular: item.ini_horario_titular ? item.ini_horario_titular : '',
                    fin_horario_titular: item.fin_horario_titular ? item.fin_horario_titular : ''
                });
            }
        } else {
            checadasClasificadas.push({
                ...item,
                type: 'SALIDA',
                schedule,
                guardias: guards,
                label: item.label ? item.label : labelEstrategia,
                ini_horario_titular: item.ini_horario_titular ? item.ini_horario_titular : '',
                fin_horario_titular: item.fin_horario_titular ? item.fin_horario_titular : ''
            });
        }
    });

    return checadasClasificadas;
};

const IOPermisos: IOPermisosInterface = {//Obj de permisos para mapear en donde aparecen checadas. Los permisos donde no aparecen checadas son añadidos en otro proceso. Si un permiso no aparece aqui, no aparecerá en el reporte.
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
    },
    'PATERNIDAD': {
        type: 'AMBOS'
    },
    'LICENCIA MEDICA POR ACCIDENTE DE TRABAJO': {
        type: 'AMBOS'
    },
    'REPOSICION': {
        type: 'AMBOS'
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
                classifiedAttendances.push({ ...item, event: item.label ? ''.concat(item.label) : '' });
            } else if (item.horaReg >= horaEntradaLimite && item.horaReg < horaEntradaMaxima) {
                classifiedAttendances.push({ ...item, event: item.label ? 'RETARDO MENOR, '.concat(item.label) : 'RETARDO MENOR' });
            } else {
                classifiedAttendances.push({ ...item, event: item.label ? 'OMISIÓN DE ENTRADA, '.concat(item.label) : 'OMISIÓN DE ENTRADA' });
            }
        } else if (item.type === 'SALIDA') {
            classifiedAttendances.push({ ...item, event: item.label ? ''.concat(item.label) : '' });
            /* if (item.horaReg >= horaSalidaPermitida && item.horaReg < horaSalidaMaxima) {
                classifiedAttendances.push({ ...item, event: item.label ? ''.concat(item.label) : '' });
            } */
        }
    });

    //PERMISOS
    let sharedDays: any[] = [];

    //Quitar permisos de estrategias para que no sean mapeados en el reporte para IMSS BIENESTAR
    if (employee.cat_tipos_empleado.nombre === 'BASE IMSS BIENESTAR') {
        permisos = permisos.filter((item: any) => item.cat_permisos.nombre !== 'ESTRATEGIA');
    }

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
        // Buscar si la fecha de item1 coincide con permisos capturados en esa fecha
        const matchingItem = sharedDays.filter(item2 => item2.dateReg === item1.dateReg);

        // Si se encuentra un elemento coincidente, agregar el valor de 'event' dependiendo del permiso a entrada, salida o ambos
        if (!matchingItem) return;

        matchingItem.forEach((permiso: any) => {
            const permisoType = IOPermisos[permiso.event]?.type;

            if (permisoType === item1.type) {
                if (item1.event === 'RETARDO MENOR' && permiso.event === 'AUTORIZACIÓN DE ENTRADA') {
                    item1.event += permiso.event;
                } else {
                    //si item1.event es '', 
                    item1.event += item1.event ? `, ${permiso.event}` : permiso.event;
                }
            } else if (permisoType === 'AMBOS') {
                item1.event += item1.event ? `, ${permiso.event}` : permiso.event;
            }
        });
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
    const permissions = ['AUTORIZACIÓN DE ENTRADA', 'AUTORIZACIÓN DE SALIDA', 'LICENCIA MEDICA', 'SUSPENSION', 'COMISION OFICIAL', 'PERMANENCIA CONSULTA MÉDICA', 'JUST CAM', 'JUST POR OFICIO', 'PASE DE ENTRADA POR HORAS FESTIVAS', 'PASE DE SALIDA POR HORAS FESTIVAS', 'REPOSICION'];

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

const checadaEmpleadoRegularIrregular = (sortedData: any, currentItem: any, employee: any, shouldAddOmission: any) => { // Regular -> Checa Entrada/Salida en un día, Irregular -> Checa Entrada en un día y Salida en otro
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
        //REMOVER OMISIÓN DE ENTRADA AGREGADO PREVIAMENTE POR TEMA DE HORARIO, SI TIENE UN PERMISO DE JUSTIFICACIÓN
        if (currentItem.event.includes("OMISIÓN DE ENTRADA,") && !shouldAddOmission) {
            return { ...currentItem, event: currentItem.event.replace("OMISIÓN DE ENTRADA, ", "") };
        }

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
                    guardias: filteredHistorial[0].guardias === 'null' ? JSON.parse(decodeURIComponent(employee.guardias)) : JSON.parse(decodeURIComponent(filteredHistorial[0].guardias))
                }
            }
        }
    }
}

export const calcIncidencias = (empleado: any) => {

    const descuentos = empleado.final
        .filter((item: any) => item.event.includes('FALTA'))
        .map((obj: any) => dayjs.utc(obj.dateReg).format('DD/MM/YYYY')).join(', ');

    const omisones = empleado.final
        .filter((item: any) => item.event.includes('OMISIÓN') || item.event.includes('OMISION'))
        .map((obj: any) => dayjs.utc(obj.dateReg).format('DD/MM/YYYY')).join(', ');

    const suspension = empleado.final
        .filter((item: any) => item.event.includes('SUSPENSION'))
        .map((obj: any) => dayjs.utc(obj.dateReg).format('DD/MM/YYYY')).join(', ');


    return {
        diasDescuento: descuentos,
        diasOmision: omisones,
        diasSuspension: suspension
    }
}

export const procesarEstrategiasTitular = async (tipoEmpleado: string, matriculaEmpleado: number, permisos: any, fechaIniCalendario: string, fechaFinCalendario: string) => {
    if (tipoEmpleado !== 'BASE IMSS BIENESTAR') return [];

    const estrategias = permisos.filter((permiso: any) =>
        permiso.cat_permisos.nombre === 'ESTRATEGIA' &&
        permiso.rch_empleados_rch_permisos_id_suplenteTorch_empleados.matricula !== matriculaEmpleado &&
        dayjs.utc(permiso.fecha_inicio).format('YYYY-MM-DD') >= fechaIniCalendario &&
        dayjs.utc(permiso.fecha_inicio).format('YYYY-MM-DD') <= fechaFinCalendario
    );

    if (estrategias.length === 0) return [];

    let checadasSuplente = await Promise.all(
        estrategias.map(async (estrategia: any) => {
            let nombre: string = estrategia.rch_empleados_rch_permisos_id_suplenteTorch_empleados.cmp_persona.nombres + ' ' + estrategia.rch_empleados_rch_permisos_id_suplenteTorch_empleados.cmp_persona.primer_apellido + ' ' + estrategia.rch_empleados_rch_permisos_id_suplenteTorch_empleados.cmp_persona.segundo_apellido;

            const data = await getAttendancesReport(
                estrategia.rch_empleados_rch_permisos_id_suplenteTorch_empleados.matricula,
                estrategia.rch_empleados_rch_permisos_id_suplenteTorch_empleados.matricula,
                fechaIniCalendario,
                fechaFinCalendario
            );

            const substituteAttendances = getUnrepeatedAttendances(data.attendances);
            const strategyAttendances = getAttendancesPerPermissionDateRange(substituteAttendances, estrategia.fecha_inicio, estrategia.fecha_fin, estrategia.ini_horario_suplente, estrategia.fin_horario_suplente, estrategia.rch_empleados.guardias);

            const strategyAttendancesWithLabel = strategyAttendances.map((attendance) => {
                return {
                    ...attendance,
                    label: `TxT ${estrategia.rch_empleados_rch_permisos_id_suplenteTorch_empleados.matricula} ${nombre}`,
                    ini_horario_titular: estrategia.ini_horario_titular,
                    fin_horario_titular: estrategia.fin_horario_titular
                }
            })

            return {
                data: strategyAttendancesWithLabel,
            };
        })
    );

    return checadasSuplente;
}

export const procesarEstrategiasSuplente = async (tipoEmpleado: string, matriculaEmpleado: number, permisos: any, fechaIniCalendario: string, fechaFinCalendario: string) => {
    if (tipoEmpleado !== 'BASE IMSS BIENESTAR') return [];

    const estrategias = permisos.filter((permiso: any) =>
        permiso.cat_permisos.nombre === 'ESTRATEGIA' &&
        permiso.rch_empleados_rch_permisos_id_suplenteTorch_empleados.matricula === matriculaEmpleado &&
        dayjs.utc(permiso.fecha_inicio).format('YYYY-MM-DD') >= fechaIniCalendario &&
        dayjs.utc(permiso.fecha_inicio).format('YYYY-MM-DD') <= fechaFinCalendario
    );

    if (estrategias.length === 0) return [];

    const result: PropsEstrategiasSuplente[] = [];

    for (let index = 0; index < estrategias.length; index++) {
        let itemAux = { ...estrategias[index] }

        const historialTitular: any = await getEmployeeShiftQuery(estrategias[index].rch_empleados.id);
        const { horario_actual: actualTitular } = getEmployeeDataPerDateRange(historialTitular, fechaIniCalendario, fechaFinCalendario, estrategias[index].rch_empleados.hora_entrada, estrategias[index].rch_empleados.hora_salida, estrategias[index].rch_empleados);
        const nombre = estrategias[index].rch_empleados.cmp_persona.nombres + ' ' + estrategias[index].rch_empleados.cmp_persona.primer_apellido + ' ' + estrategias[index].rch_empleados.cmp_persona.segundo_apellido;

        if (estrategias[index].fecha_inicio === estrategias[index].fecha_fin) {
            result.push({
                matricula: estrategias[index].rch_empleados.matricula,
                hora_entrada: actualTitular.hora_entrada,
                hora_salida: actualTitular.hora_salida,
                guardias: actualTitular.guardias,
                fecha: estrategias[index].fecha_inicio,
                label: `TxT ${estrategias[index].rch_empleados.matricula} ${nombre}`,
            });
        } else {
            while (dayjs.utc(itemAux.fecha_inicio).format('YYYY-MM-DD') <= dayjs.utc(itemAux.fecha_fin).format('YYYY-MM-DD')) {
                result.push({
                    matricula: estrategias[index].rch_empleados.matricula,
                    hora_entrada: actualTitular.hora_entrada,
                    hora_salida: actualTitular.hora_salida,
                    guardias: actualTitular.guardias,
                    fecha: itemAux.fecha_inicio,
                    label: `TxT ${estrategias[index].rch_empleados.matricula} ${nombre}`,
                });

                itemAux.fecha_inicio = dayjs(itemAux.fecha_inicio).add(1, 'day').toISOString();
            }
        }
    }

    return result;
}
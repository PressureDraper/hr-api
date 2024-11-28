import moment from "moment";
import { ReqHistorialHorario, ReqPermisosPerEmpleadoInterface, ReqVacacionesPerEmpleadoIdInterface, dataChecadasIndividualInterface, Cat_Tipos_Empleado } from '../interfaces/reportsQueries';
import { db } from "../utils/db";
import { getChecadaEmpleadoRange } from "./reportsQueries";
import { getEmployeesPermissionsQuery } from "./permissionsQueries";
import { groupBy } from 'lodash'
import { getVacationQueryPerEmployeeId } from "./vacationQueries";

// Función para convertir el tiempo 'HH:MM:SS' a segundos
const timeToSeconds = (time: string) => {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}

export const formatHorarioConHistorial = (historial: any, attendances: any) => {

    const newAttendances: dataChecadasIndividualInterface = attendances.map((data: dataChecadasIndividualInterface) => {

        let checada = {
            biometric: data.biometric,
            dateReg: moment(data.dateReg).utc().format('YYYY-MM-DD'),
            horaReg: moment(moment.utc(data.horaReg, "HH:mm").toISOString()).utc().format('HH:mm'),
            horaRegSeg: data.horaReg,
            mat: data.mat,
            horaEntrada: historial[0].hora_entrada,
            horaSalida: historial[0].hora_salida
        }

        for (let index = 0; index < historial.length; index++) {

            if (checada.dateReg >= historial[index].fecha_inicio) {
                checada.horaEntrada = historial[index].hora_entrada
                checada.horaSalida = historial[index].hora_salida
            }

        }

        return checada;

    });

    return newAttendances;
}

export const formatHorarioSinHistorial = (attendances: any, horaEntrada: string, horaSalida: string) => {

    const newAttendances: dataChecadasIndividualInterface = attendances.map((data: dataChecadasIndividualInterface) => {

        let checada = {
            biometric: data.biometric,
            dateReg: moment(data.dateReg).utc().format('YYYY-MM-DD'),
            horaReg: moment(moment.utc(data.horaReg, "HH:mm").toISOString()).utc().format('HH:mm'),
            horaRegSeg: data.horaReg,
            mat: data.mat,
            horaEntrada: moment(horaEntrada).utc().format('HH:mm'),
            horaSalida: moment(horaSalida).utc().format('HH:mm')
        }

        return checada;

    });

    return newAttendances;
}

export const formatHistorial = (historial: any) => {

    let history: ReqHistorialHorario = historial.map((data: ReqHistorialHorario) => {
        return {
            fecha_inicio: moment(data.fecha_inicio).utc().format('YYYY-MM-DD'),
            hora_entrada: moment(data.hora_entrada).utc().format('HH:mm'),
            hora_salida: moment(data.hora_salida).utc().format('HH:mm')
        }
    });

    //order by fecha_inicio property to be chronologically
    history = history.sort((a: ReqHistorialHorario, b: ReqHistorialHorario) => a.fecha_inicio.localeCompare(b.fecha_inicio));

    return history;
}

export const getLastAttendancePerMinute = (attendances: dataChecadasIndividualInterface) => {
    const groupedByDateAndMinute: any = attendances.reduce((acc: any, obj: dataChecadasIndividualInterface) => {
        const key = `${obj.dateReg}-${obj.horaReg}`;

        if (!acc[key] || timeToSeconds(obj.horaRegSeg) > timeToSeconds(acc[key].horaRegSeg)) {
            acc[key] = obj;
        }

        return acc;
    }, {});

    // Paso 2: Obtener los objetos más recientes por minuto para cada fecha
    const result: any[] = Object.values(groupedByDateAndMinute);
    return result;
}

export const clasificarChecada = (data: dataChecadasIndividualInterface, horaEntrada: string, horaSalida: string, regist: dataChecadasIndividualInterface, j91: string[], aentrada: string[], asalida: string[], tipo_empleado: string) => {
    let horaEntradaLimite: string = ''; //variable en función del tipo de empleado

    const horaEntradaPermitida = moment(horaEntrada, "HH:mm").subtract(30, 'minutes').format('HH:mm'); //30 minutos antes de hora de entrada

    if (tipo_empleado.includes('BASE IMSS BIENESTAR')) {
        horaEntradaLimite = moment(horaEntrada, "HH:mm").add(6, 'minutes').format('HH:mm'); //entrada sin retardo 6 minutos despues
    } else {
        horaEntradaLimite = moment(horaEntrada, "HH:mm").add(16, 'minutes').format('HH:mm'); //entrada sin retardo 16 minutos despues
    }
    
    const horaEntradaRetardo = moment(horaEntrada, "HH:mm").add(41, 'minutes').format('HH:mm'); //Manejar retardo menor y mayor
    const horaSalidaPermitida = moment(horaSalida, "HH:mm").subtract(2, 'hours').format('HH:mm'); //hora de salida menos 2 horas si es que pide pase
    const horaSalidaLimite = moment(horaSalida, "HH:mm").add(2, 'hours').format('HH:mm'); //2 horas despues de la salida    

    if (data.horaReg >= horaSalidaPermitida && data.horaReg <= horaSalidaLimite) { //salida

        return {
            title: 'NONE',
            date: data.dateReg
        }

    } else if (data.horaReg >= horaEntradaPermitida && data.horaReg < horaEntradaRetardo) {//entrada normal y rmenor

        if (data.horaReg >= horaEntradaPermitida && data.horaReg < horaEntradaLimite) { //condicion de checada normal

            return {
                title: 'NONE',
                date: data.dateReg
            }

        } else if (data.horaReg >= horaEntradaLimite && data.horaReg < horaEntradaRetardo) { //condicion de checada con retardo menor

            if (regist.find(item => item.dateReg === data.dateReg)) { //Evitar etiquetas de retardo menor duplicadas
                return {
                    title: 'NONE',
                    date: data.dateReg
                }
            } else {
                if (j91.includes(data.dateReg)) { //justificar retardo menor
                    return {
                        title: 'J91',
                        date: data.dateReg
                    }
                } else {
                    return {
                        title: 'RETARDO MENOR',
                        date: data.dateReg
                    }
                }
            }
        }

    } else { //omisiones e incidencias

        if (data.horaReg >= horaEntradaRetardo && data.horaReg <= moment(horaEntradaRetardo, "HH:mm").add(2, 'hours').format('HH:mm')) { //condicion omision entrada

            if (regist.find(item => item.dateReg === data.dateReg)) { //Evitar etiquetas de Omision Entrada duplicadas
                return {
                    title: 'NONE',
                    date: data.dateReg
                }
            } else {
                if (aentrada.includes(data.dateReg)) {
                    return {
                        title: 'AE',
                        date: data.dateReg
                    }
                } else {
                    return {
                        title: 'OMISIÓN ENTRADA',
                        date: data.dateReg
                    }
                }
            }

        } else { //incidencia, caso fuera de lo normal
            return {
                title: 'INCIDENCIA',
                date: data.dateReg,
            }
        }
    }
}

const depurarChecadas = (formatAttendance: any[], j91: string[], aentrada: string[], asalida: string[], aeLocal: any[], asLocal: any[], permisosAux: any[], vacacionesAux: any[], tipo_empleado: string) => {
    let regist: any = [];
    const checadas = formatAttendance.map((checada: dataChecadasIndividualInterface) => {
        const checadaClasificada = clasificarChecada(checada, checada.horaEntrada!, checada.horaSalida!, regist, j91, aentrada, asalida, tipo_empleado);
        regist = [...regist, checada]; //no usar push por que el objeto sufre mutaciones inesperadas, usar spread

        if (checadaClasificada?.title.includes('AE')) {
            aeLocal = [...aeLocal, checada.dateReg]
        } else if (checadaClasificada?.title.includes('AS')) {
            asLocal = [...asLocal, checada.dateReg]
        }

        return checadaClasificada;
    });

    const checadasDepuradas = checadas.filter((checada) => checada?.title !== 'NONE' && checada?.title !== 'J91' && checada?.title !== 'AE');

    for (let i = 0; i < permisosAux.length; i++) {
        const fecha1 = permisosAux[i].date;

        // Buscar si la fecha de arreglo1 existe en arreglo2
        for (let j = 0; j < checadasDepuradas.length; j++) {
            const fecha2 = checadasDepuradas[j]?.date;

            if (fecha1 === fecha2) {
                // Eliminar el elemento de arreglo2 si las fechas coinciden
                checadasDepuradas.splice(j, 1);
                // Reducir el índice de j para no saltarse elementos al eliminar
                j--;
                break; // Salir del bucle interno después de eliminar el elemento
            }
        }
    }

    // Eliminar duplicados en arreglo2 basándose en fecha y título
    const seen = new Set();
    for (let i = 0; i < checadasDepuradas.length; i++) {
        const key = `${checadasDepuradas[i]?.date}_${checadasDepuradas[i]?.title}`;
        if (seen.has(key)) {
            checadasDepuradas.splice(i, 1);
            i--; // Ajustar el índice después de eliminar
        } else {
            seen.add(key);
        }
    }

    let checadasConcat = permisosAux.concat(checadasDepuradas);
    checadasConcat = checadasConcat.concat(vacacionesAux);

    checadasConcat.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();  // Comparar las fechas como números
    });

    const eventos = groupBy(checadasConcat, 'date');

    return eventos;
}

export const getAttendanceClassify = async ({ ...props }: { dateInit: string, dateFin: string, id: string }) => {
    try {
        let j91: string[] = [];
        let aentrada: string[] = [];
        let asalida: string[] = [];
        let aeLocal: any[] = [];
        let asLocal: any[] = [];
        let permisosAux: any = [];
        let vacacionesAux: any = [];

        let employee: any = await db.rch_empleados.findUnique({
            where: {
                id: parseInt(props.id)
            },
            select: {
                id: true,
                matricula: true,
                hora_entrada: true,
                hora_salida: true,
                cat_tipos_empleado: {
                    select: { nombre: true }
                }
            }
        });

        let Historial: any = await db.rch_empleados_historial_horarios.findMany({
            where: {
                id_empleado: employee.id
            },
            select: {
                fecha_inicio: true,
                hora_entrada: true,
                hora_salida: true
            }
        });

        let vacaciones: any = await db.rch_empleado_vacaciones.findMany({
            where: {
                rch_empleados: {
                    id: employee.id
                },
                fecha_inicio: { lte: new Date(moment(props.dateFin).format('YYYY-MM-DD')) },
                fecha_fin: { gte: new Date(moment(props.dateInit).format('YYYY-MM-DD')) },
                tipo: 'VACACIONES',
                deleted_at: null
            },
            select: {
                rol: true,
                fecha_inicio: true,
                fecha_fin: true
            }
        })

        employee.historial = Historial;

        const req = await getChecadaEmpleadoRange(employee.matricula, props.dateInit, props.dateFin);
        const historialHorario = formatHistorial(employee.historial);
        const permisos: any = await getEmployeesPermissionsQuery({ employee_id: employee.id, fecha_ini: props.dateInit, fecha_fin: props.dateFin });

        vacaciones.forEach((date: ReqVacacionesPerEmpleadoIdInterface) => {
            while (moment.utc(date.fecha_inicio).isSameOrBefore(moment.utc(date.fecha_fin))) {
                if (moment.utc(date.fecha_inicio).isSameOrAfter(moment.utc(props.dateInit))) {
                    vacacionesAux.push({
                        title: `VACACIONES ROL ${date.rol}`,
                        date: moment.utc(date.fecha_inicio).format('YYYY-MM-DD')
                    })
                }
                date.fecha_inicio = moment(date.fecha_inicio).add(1, 'day').toISOString();
            }
        });

        //permisos
        permisos.forEach((item: ReqPermisosPerEmpleadoInterface) => {
            let itemAux = { ...item } //make copy of item to treat them separately and avoid memory problems. important!!!

            if (itemAux.cat_permisos.nombre.includes('J91')) {
                if (itemAux.fecha_inicio != itemAux.fecha_fin) {
                    while (moment(itemAux.fecha_inicio).isSameOrBefore(moment(itemAux.fecha_fin))) {
                        j91.push(moment.utc(itemAux.fecha_inicio).format('YYYY-MM-DD'));
                        itemAux.fecha_inicio = moment(itemAux.fecha_inicio).add(1, 'day').toISOString()
                    }
                } else {
                    j91.push(moment.utc(itemAux.fecha_inicio).format('YYYY-MM-DD'));
                }
            } else if (itemAux.cat_permisos.nombre.includes('AUTORIZACIÓN DE ENTRADA')) {
                if (itemAux.fecha_inicio != itemAux.fecha_fin) {
                    while (moment(itemAux.fecha_inicio).isSameOrBefore(moment(itemAux.fecha_fin))) {
                        aentrada.push(moment.utc(itemAux.fecha_inicio).format('YYYY-MM-DD'));
                        itemAux.fecha_inicio = moment(itemAux.fecha_inicio).add(1, 'day').toISOString()
                    }
                } else {
                    aentrada.push(moment.utc(itemAux.fecha_inicio).format('YYYY-MM-DD'));
                }
            } else if (itemAux.cat_permisos.nombre.includes('AUTORIZACIÓN DE SALIDA')) {
                if (itemAux.fecha_inicio != itemAux.fecha_fin) {
                    while (moment(itemAux.fecha_inicio).isSameOrBefore(moment(itemAux.fecha_fin))) {
                        asalida.push(moment.utc(itemAux.fecha_inicio).format('YYYY-MM-DD'));
                        itemAux.fecha_inicio = moment(itemAux.fecha_inicio).add(1, 'day').toISOString()
                    }
                } else {
                    asalida.push(moment.utc(itemAux.fecha_inicio).format('YYYY-MM-DD'));
                }
            }

            //use original item
            if (item.fecha_inicio === item.fecha_fin) { //si es permiso de un día
                permisosAux.push({
                    title: `${item.cat_permisos.nombre}`,
                    date: moment.utc(item.fecha_inicio).format('YYYY-MM-DD')
                })
            } else { //permiso de varios dias
                while (moment.utc(item.fecha_inicio).isSameOrBefore(moment.utc(item.fecha_fin))) {
                    permisosAux.push({
                        title: `${item.cat_permisos.nombre}`,
                        date: moment.utc(item.fecha_inicio).format('YYYY-MM-DD')
                    })
                    item.fecha_inicio = moment(item.fecha_inicio).add(1, 'day').toISOString()
                }
            }
        });

        if (historialHorario.length > 0 && req.attendances.length > 0) {
            const attendance = formatHorarioConHistorial(historialHorario, req.attendances);
            const formatAttendance = getLastAttendancePerMinute(attendance);
            const checadasDepuradas = depurarChecadas(formatAttendance, j91, aentrada, asalida, aeLocal, asLocal, permisosAux, vacacionesAux, employee.cat_tipos_empleado.nombre);

            return checadasDepuradas;
        } else {
            const attendance = formatHorarioSinHistorial(req.attendances, employee.hora_entrada, employee.hora_salida);
            const formatAttendance = getLastAttendancePerMinute(attendance);
            const checadasDepuradas = depurarChecadas(formatAttendance, j91, aentrada, asalida, aeLocal, asLocal, permisosAux, vacacionesAux, employee.cat_tipos_empleado.nombre);

            return checadasDepuradas;
        }

    } catch (error) {
        return error;
    }
}
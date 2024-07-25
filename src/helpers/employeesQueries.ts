import moment from "moment";
import { PropsGetEmployeeQueries, ShiftsHistoryQueries, SicaEmployeeQueries, GuardsInterface } from "../interfaces/employeesQueries";
import { db } from "../utils/db";

export const getEmployeePerIdsQuery = (data: PropsGetEmployeeQueries) => {
    return new Promise(async (resolve, reject) => {
        try {
            const empleados = JSON.parse(decodeURIComponent(data.data));
            const array = await Promise.all(
                empleados.map(async (id: number) => {
                    const reg = await db.rch_empleados.findFirst({
                        where: {
                            id,
                            activo: true,
                            deleted_at: null
                        },
                        select: {
                            id: true,
                            matricula: true,
                            cmp_persona: {
                                select: {
                                    id: true,
                                    nombres: true,
                                    primer_apellido: true,
                                    segundo_apellido: true,
                                    curp: true,
                                    rfc: true,
                                    sexo: true
                                }
                            }
                        }
                    });
                    return reg;
                })
            );

            resolve(array);
        } catch (error) {
            reject(error);
        }
    })
}

export const getEmployeeQuery = ({ limit = '10', page = '0', nameFilter = '', enrollmentFilter = '' }: SicaEmployeeQueries) => {
    return new Promise(async (resolve, reject) => {
        try {
            const rowsPerPage = parseInt(limit);
            const min = ((parseInt(page) + 1) * rowsPerPage) - rowsPerPage;

            let listEmployee: any = await db.rch_empleados.findMany({
                where: {
                    cmp_persona: {
                        OR: [
                            { nombres: { contains: nameFilter } },
                            { primer_apellido: { contains: nameFilter } },
                            { segundo_apellido: { contains: nameFilter } }
                        ]
                    },
                    matricula: enrollmentFilter ? parseInt(enrollmentFilter) : {},
                    activo: true,
                    deleted_at: null
                },
                select: {
                    id: true,
                    matricula: true,
                    cmp_persona: {
                        select: {
                            nombres: true,
                            primer_apellido: true,
                            segundo_apellido: true,
                            curp: true,
                            rfc: true,
                            fecha_nacimiento: true,
                            cmp_contactos: {
                                select: {
                                    descripcion: true,
                                    tipo: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    id: 'desc'
                },
                skip: min,
                take: rowsPerPage
            })

            resolve(listEmployee);
        } catch (error) {
            reject(error);
        }
    })
}

export const getKardexQuery = (id: number) => {
    return new Promise(async (resolve, reject) => {
        try {

            let Employee: any = await db.rch_empleados.findUnique({
                where: {
                    id
                },
                select: {
                    id: true,
                    matricula: true,
                    hora_entrada: true,
                    hora_salida: true,
                    guardias: true,
                    cmp_persona: {
                        select: {
                            nombres: true,
                            primer_apellido: true,
                            segundo_apellido: true,
                        }
                    },
                    cat_tipos_empleado: {
                        select: {
                            nombre: true
                        }
                    },
                    cat_departamentos: {
                        select: {
                            nombre: true
                        }
                    },
                    cat_turnos: {
                        select: {
                            nombre: true
                        }
                    }
                }
            });

            let Historial: any = await db.rch_empleados_historial_horarios.findMany({
                where: {
                    id_empleado: id
                },
                select: {
                    fecha_inicio: true,
                    hora_entrada: true,
                    hora_salida: true
                }
            });

            Employee.historial = Historial;

            resolve(Employee);
        } catch (error) {
            reject(error);
        }
    })
}

export const createShiftHistoryQuery = ({ ...data }: ShiftsHistoryQueries) => {

    return new Promise(async (resolve, reject) => {
        try {

            const repeated: any = await db.rch_empleados_historial_horarios.findFirst({ //ver si el registro ya existe
                where: {
                    id_empleado: data.id_empleado,
                    fecha_inicio: moment.utc(data.fec_inicio).toISOString(),
                }
            });

            const formatGuardias = data.guardias.map((data: GuardsInterface) => { //darle formato a las guardias para guardarlas
                return data.title
            });

            const userRegistro = await db.users.findFirst({ //obtener el username y id de la tabla user para ver quiem realizo la accion
                where: {
                    id_empleado: data.id_registro
                },
                select: {
                    id: true,
                    username: true
                }
            })

            const isFirstHistoryChange = await db.rch_empleados_historial_horarios.findFirst({ //verificar si es el primer cambio de horario del empleado
                where: {
                    id_empleado: data.id_empleado
                }
            })

            if (isFirstHistoryChange == null) { //si no tiene historial
                const baseData = await db.rch_empleados.findUnique({ //consultar el horario actual
                    where: {
                        id: data.id_empleado
                    },
                    select: {
                        id_turno: true,
                        fecha_alta: true,
                        hora_entrada: true,
                        hora_salida: true,
                        guardias: true,
                        observaciones: true
                    }
                });

                await db.rch_empleados_historial_horarios.create({//crear un primer registro como punto de partida para el calendario
                    data: {
                        id_empleado: data.id_empleado,
                        id_turno: baseData?.id_turno,
                        fecha_inicio: baseData?.fecha_alta,
                        hora_entrada: baseData?.hora_entrada,
                        hora_salida: baseData?.hora_salida,
                        guardias: baseData?.guardias,
                        observaciones: baseData?.observaciones == '' ? null : baseData?.observaciones,
                        idUser: userRegistro?.id,
                        nick: userRegistro?.username,
                        created_at: moment.utc().subtract(6, 'hour').toISOString(), //gmt -6
                        updated_at: moment.utc().subtract(6, 'hour').toISOString()
                    }
                });

                let record = await db.rch_empleados_historial_horarios.create({ //crear el registro enviado del front
                    data: {
                        id_empleado: data.id_empleado,
                        id_turno: data.turno.id,
                        fecha_inicio: moment.utc(data.fec_inicio).toISOString(),
                        hora_entrada: moment.utc(data.hora_entrada, 'HH:mm:ss').toISOString(),
                        hora_salida: moment.utc(data.hora_salida, 'HH:mm:ss').toISOString(),
                        guardias: JSON.stringify(formatGuardias),
                        observaciones: data.observaciones === '' ? null : data.observaciones,
                        idUser: userRegistro?.id,
                        nick: userRegistro?.username,
                        created_at: moment.utc().subtract(6, 'hour').toISOString(), //gmt -6
                        updated_at: moment.utc().subtract(6, 'hour').toISOString()
                    }
                });

                setTimeout(async () => {
                    await db.rch_empleados.update({ //actualizar la tabla de rch_empleados
                        where: {
                            id: data.id_empleado
                        },
                        data: {
                            hora_entrada: moment.utc(data.hora_entrada, 'HH:mm:ss').toISOString(),
                            hora_salida: moment.utc(data.hora_salida, 'HH:mm:ss').toISOString(),
                            guardias: JSON.stringify(formatGuardias),
                            updated_at: moment.utc().subtract(6, 'hour').toISOString(),
                            id_turno: data.turno.id
                        }
                    });

                    resolve(record);
                }, 50);

            } else { //si ya le han cambiado el horario antes
                if (repeated) {
                    resolve({}); //duplicated entry
                } else {
                    let record = await db.rch_empleados_historial_horarios.create({
                        data: {
                            id_empleado: data.id_empleado,
                            id_turno: data.turno.id,
                            fecha_inicio: moment.utc(data.fec_inicio).toISOString(),
                            hora_entrada: moment.utc(data.hora_entrada, 'HH:mm:ss').toISOString(),
                            hora_salida: moment.utc(data.hora_salida, 'HH:mm:ss').toISOString(),
                            guardias: JSON.stringify(formatGuardias),
                            observaciones: data.observaciones === '' ? null : data.observaciones,
                            idUser: userRegistro?.id,
                            nick: userRegistro?.username,
                            created_at: moment.utc().subtract(6, 'hour').toISOString(), //gmt -6
                            updated_at: moment.utc().subtract(6, 'hour').toISOString()
                        }
                    });

                    await db.rch_empleados.update({
                        where: {
                            id: data.id_empleado
                        },
                        data: {
                            hora_entrada: moment.utc(data.hora_entrada, 'HH:mm:ss').toISOString(),
                            hora_salida: moment.utc(data.hora_salida, 'HH:mm:ss').toISOString(),
                            guardias: JSON.stringify(formatGuardias),
                            updated_at: moment.utc().subtract(6, 'hour').toISOString(),
                            id_turno: data.turno.id
                        }
                    })

                    resolve(record);
                }
            }
        } catch (error) {
            reject(error);
        }
    });
}

export const getEmployeeTypeCatalogQuery = () => {
    return new Promise(async (resolve, reject) => {
        try {

            let listTypes: any = await db.cat_tipos_empleado.findMany({
                select: {
                    id: true,
                    nombre: true,
                    clave: true
                }
            });

            resolve(listTypes);
        } catch (error) {
            reject(error);
        }
    })
}
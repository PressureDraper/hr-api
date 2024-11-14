import moment from "moment";
import { PropsCreateVacationQueries, PropsGetTotalVacationQueries, PropsGetVacationEmployeeIdInterface, PropsGetVacationQueries, PropsUpdateVacationQueries } from "../interfaces/vacationQueries";
import { db } from "../utils/db";

export const getVacationQuery = ({ empleado = '', ...props }: PropsGetVacationQueries) => {
    return new Promise(async (resolve, reject) => {
        try {
            const rowsPerPage = parseInt(props.limit);
            const min = ((parseInt(props.page) + 1) * rowsPerPage) - rowsPerPage;

            let listVacation = await db.rch_empleado_vacaciones.findMany({
                where: {
                    rch_empleados: {
                        matricula: props.matricula ? parseInt(props.matricula) : {},
                        cmp_persona: {
                            OR: [
                                { nombres: { contains: empleado } },
                                { primer_apellido: { contains: empleado } },
                                { segundo_apellido: { contains: empleado } }
                            ]
                        },
                        cat_departamentos: {
                            nombre: props.departamento ? { contains: props.departamento } : {}
                        }
                    },
                    /* tipo: props.tipo ? { contains: props.tipo } : {}, */
                    tipo: 'VACACIONES',
                    rol: props.rol ? { contains: props.rol } : {},
                    fecha_inicio: props.fec_inicial ? moment.utc(props.fec_inicial).toISOString() : {},
                    fecha_fin: props.fec_final ? moment.utc(props.fec_final).toISOString() : {},
                    deleted_at: null
                },
                select: {
                    id: true,
                    id_empleado: true,
                    rch_empleados: {
                        select: {
                            matricula: true,
                            cmp_persona: {
                                select: { nombres: true, primer_apellido: true, segundo_apellido: true }
                            },
                            cat_departamentos: {
                                select: { nombre: true }
                            }
                        }
                    },
                    tipo: true,
                    rol: true,
                    fecha_inicio: true,
                    fecha_fin: true
                },
                orderBy: {
                    id: "desc"
                },
                skip: min,
                take: rowsPerPage
            });

            resolve(listVacation);
        } catch (error) {
            reject(error);
        }
    })
}

export const getVacationQueryPerEmployeeId = ({ id, fecha_ini, fecha_fin }: PropsGetVacationEmployeeIdInterface) => {
    return new Promise(async (resolve, reject) => {
        try {
            let listVacation = await db.rch_empleado_vacaciones.findMany({
                where: {
                    rch_empleados: {
                        id: parseInt(id)
                    },
                    OR: [
                        { fecha_inicio: { gte: new Date(moment(fecha_ini).format('YYYY-MM-DD')), lte: new Date(moment(fecha_fin).format('YYYY-MM-DD')) } },
                        { fecha_fin: { gte: new Date(moment(fecha_ini).format('YYYY-MM-DD')), lte: new Date(moment(fecha_fin).format('YYYY-MM-DD')) } }
                    ],
                    tipo: 'VACACIONES',
                    deleted_at: null
                },
                select: {
                    rol: true,
                    fecha_inicio: true,
                    fecha_fin: true
                }
            });

            resolve(listVacation);
        } catch (error) {
            reject(error);
        }
    })
}

export const getTotalVacationQuery = ({ empleado = '', ...props }: PropsGetTotalVacationQueries) => {
    return new Promise(async (resolve, reject) => {
        try {

            let countListVacation = await db.rch_empleado_vacaciones.count({
                where: {
                    rch_empleados: {
                        matricula: props.matricula ? parseInt(props.matricula) : {},
                        cmp_persona: {
                            OR: [
                                { nombres: { contains: empleado } },
                                { primer_apellido: { contains: empleado } },
                                { segundo_apellido: { contains: empleado } }
                            ]
                        },
                    },
                    rol: props.rol ? { contains: props.rol } : {},
                    tipo: 'VACACIONES',
                    fecha_inicio: props.fec_inicial ? moment.utc(props.fec_inicial).toISOString() : {},
                    deleted_at: null
                }
            });

            countListVacation ? (

                resolve(countListVacation)

            ) : resolve(0);
        } catch (error) {
            console.log(error);
            reject(error);
        }
    })
}

export const createVacationQuery = ({ ...props }: PropsCreateVacationQueries) => {
    return new Promise(async (resolve, reject) => {
        try {
            const repeated: any = await db.rch_empleado_vacaciones.findFirst({
                where: {
                    id_empleado: props.empleado.id, //id y cualquier fecha que de coincidencia con una ya registrada
                    OR: [
                        { fecha_inicio: moment.utc(props.fec_inicial).toISOString() },
                        { fecha_fin: moment.utc(props.fec_final).toISOString() }
                    ],
                    deleted_at: null
                }
            });

            console.log(repeated);

            if (repeated) {
                resolve({}); //duplicated entry
            } else {
                let record = await db.rch_empleado_vacaciones.create({
                    data: {
                        id_empleado: props.empleado.id,
                        tipo: 'VACACIONES',
                        rol: props.rol,
                        fecha_inicio: moment.utc(props.fec_inicial).toISOString(),
                        fecha_fin: moment.utc(props.fec_final).toISOString(),
                        created_at: moment.utc().subtract(6, 'hour').toISOString(), //gmt -6
                        updated_at: moment.utc().subtract(6, 'hour').toISOString()
                    }
                })
                resolve(record);
            }
        } catch (error) {
            reject(error);
        }
    })
}

export const updateVacationQuery = ({ id, ...props }: PropsUpdateVacationQueries) => {
    return new Promise(async (resolve, reject) => {
        try {
            const updatedVacation = await db.rch_empleado_vacaciones.update({
                where: {
                    id
                },
                data: {
                    fecha_inicio: moment.utc(props.fec_inicial).toISOString(),
                    fecha_fin: moment.utc(props.fec_final).toISOString()
                }
            });

            resolve(updatedVacation);
        } catch (error) {
            reject(error);
        }
    });
}

export const deleteVacationQuery = (id: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const record = await db.rch_empleado_vacaciones.findUnique({
                where: {
                    id
                }
            });

            record ? (
                await db.rch_empleado_vacaciones.update({
                    where: {
                        id
                    },
                    data: {
                        deleted_at: moment.utc().subtract(6, 'hour').toISOString()
                    }
                }),

                resolve(true)

            ) : resolve(false);
        } catch (error) {
            reject(error);
        }
    })
}
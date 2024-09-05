import moment from "moment";
import { CreatePermissionQueries, PropsEmployeePermissionsQueries } from "../interfaces/permissions";
import { db } from "../utils/db";

export const getCatPermissionsQuery = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const catalogue = await db.cat_permisos.findMany({
                where: {
                    deleted_at: null
                },
                select: {
                    id: true,
                    nombre: true
                },
                orderBy: {
                    id: 'asc'
                }
            });

            resolve(catalogue);
        } catch (error) {
            reject(error);
        }
    })
}

export const getEmployeesPermissionsQuery = ({ ...props }: PropsEmployeePermissionsQueries) => {
    return new Promise(async (resolve, reject) => {
        try {
            const permissions = await db.rch_permisos.findMany({
                where: {
                    OR: [
                        { id_empleado: parseInt(props.employee_id) },
                        { id_suplente: parseInt(props.employee_id) }
                    ],
                    fecha_inicio: {
                        lte: new Date(props.fecha_fin),
                        gte: new Date(props.fecha_ini)
                    }
                },
                select: {
                    observaciones: true,
                    fecha_inicio: true,
                    fecha_fin: true,
                    created_at: true,
                    rch_empleados: { //titular
                        select: {
                            matricula: true,
                            cmp_persona: {
                                select: { nombres: true, primer_apellido: true, segundo_apellido: true }
                            }
                        }
                    },
                    rch_empleados_rch_permisos_id_suplenteTorch_empleados: { //suplente
                        select: {
                            matricula: true,
                            cmp_persona: {
                                select: { nombres: true, primer_apellido: true, segundo_apellido: true }
                            }
                        }
                    },
                    cat_permisos: {
                        select: { id: true, nombre: true }
                    },
                    rch_empleados_rch_permisos_id_blameTorch_empleados: {
                        select: {
                            matricula: true,
                            cmp_persona: { select: { users: { select: { username: true } } } }
                        }
                    }
                },
                orderBy: {
                    fecha_inicio: 'asc'
                }
            });
            
            resolve(permissions);
        } catch (error) {
            reject(error);
        }
    })
}

export const getEconomicosPerYearQuery = (id: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const currentYear = moment.utc().subtract(6, 'hour').format('YYYY'); //timestamp utc-6
            const nextYear = (parseInt(currentYear) + 1).toString();

            let record = await db.rch_permisos.findMany({
                where: {
                    id_empleado: parseInt(id),
                    cat_permisos: {
                        nombre: { contains: 'ECONÓMICO' }
                    },
                    fecha_inicio: {
                        gte: moment.utc(currentYear).toISOString(),
                        lt: moment.utc(nextYear).toISOString()
                    }
                },
                select: {
                    id: true,
                    fecha_inicio: true,
                    fecha_fin: true
                }
            });

            resolve(record);
        } catch (error) {
            reject(error);
        }
    })
}

export const createPermissionPerEmployeeQuery = ({ ...props }: CreatePermissionQueries) => {
    return new Promise(async (resolve, reject) => {
        try {
            const repeated: any = await db.rch_permisos.findFirst({
                where: {
                    id_empleado: props.employee_id,
                    id_permiso: props.permission_id,
                    fecha_inicio: moment.utc(props.dateInit).toISOString()
                }
            });

            if (repeated) {
                resolve({}); //duplicated entry
            } else {
                let record = await db.rch_permisos.create({
                    data: {
                        folio: null,
                        fecha_inicio: moment.utc(props.dateInit).toISOString(),
                        fecha_fin: props.dateFin === null ? moment.utc(props.dateInit).toISOString() : moment.utc(props.dateFin).toISOString(),
                        observaciones: props.observations,
                        autorizado: true,
                        id_empleado: props.employee_id,
                        id_suplente: props.substitute_id,
                        id_blame: props.id_blame,
                        id_permiso: props.permission_id,
                        id_extension: null,
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
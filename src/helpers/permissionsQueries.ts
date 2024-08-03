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
                    id_empleado: parseInt(props.employee_id),
                    fecha_inicio: {
                        lte: new Date(props.fecha_fin),
                        gte: new Date(props.fecha_ini)
                    }
                },
                select: {
                    observaciones: true,
                    fecha_inicio: true,
                    fecha_fin: true,
                    cat_permisos: {
                        select: { id: true, nombre: true }
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
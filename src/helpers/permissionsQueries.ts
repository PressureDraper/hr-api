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
                    created_at: true,
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

export const getPermissionDetailsQuery = (created_at: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const details = await db.rch_permisos.findMany({
                where: {
                    created_at: created_at
                },
                select: {
                    observaciones: true,
                    rch_empleados: {
                        select: {
                            matricula: true,
                            cmp_persona: {
                                select: {
                                    nombres: true,
                                    primer_apellido: true,
                                    segundo_apellido: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    id: 'asc'
                }
            });

            resolve(details);
        } catch (error) {
            reject(error);
        }
    })
}

export const createPermissionPerEmployeeQuery = ({ ...props }: CreatePermissionQueries) => {
    return new Promise(async (resolve, reject) => {
        try {
            const currentDateTime = moment.utc().subtract(6, 'hour').toISOString(); //timestamp

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
                if (props.substitute_id === null) {
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
                            created_at: currentDateTime, //gmt -6
                            updated_at: currentDateTime
                        }
                    })
                    resolve(record);
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
                            created_at: currentDateTime, //gmt -6
                            updated_at: currentDateTime
                        }
                    });

                    await db.rch_permisos.create({
                        data: {
                            folio: null,
                            fecha_inicio: moment.utc(props.dateInit).toISOString(),
                            fecha_fin: props.dateFin === null ? moment.utc(props.dateInit).toISOString() : moment.utc(props.dateFin).toISOString(),
                            observaciones: props.observations,
                            autorizado: true,
                            id_empleado: props.substitute_id,
                            id_permiso: props.permission_id,
                            id_extension: null,
                            created_at: currentDateTime, //gmt -6
                            updated_at: currentDateTime
                        }
                    });

                    resolve(record);
                }
            }
        } catch (error) {
            reject(error);
        }
    })
}
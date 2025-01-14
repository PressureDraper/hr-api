import moment from "moment";
import { CreatePermissionQueries, PropsEmployeePermissionsQueries, PropsStrategiesQueries } from "../interfaces/permissions";
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

export const getStrategiesInfoQuery = ({ limit = '10', page = '0', ...props }: PropsStrategiesQueries): Promise<{ data: any, count: number }> => {
    return new Promise(async (resolve, reject) => {
        try {
            const rowsPerPage = parseInt(limit);
            const min = ((parseInt(page) + 1) * rowsPerPage) - rowsPerPage;

            const strategies = await db.rch_permisos.findMany({
                where: {
                    folio: props.folio ? parseInt(props.folio) : {},
                    fecha_inicio: props.fec_inicial ? moment.utc(props.fec_inicial).toISOString() : {},
                    AND: [
                        {
                            created_at: props.fec_captura ? { //FECHA CAPTURA ESTRATEGIA
                                gte: moment.utc(props.fec_captura).toISOString(),
                                lt: moment.utc(props.fec_captura).add(1, 'days').toISOString()
                            } : {}
                        },
                        {
                            created_at: props.ano_captura ? { //AÑO DE CAPTURA
                                gte: moment.utc(props.ano_captura).toISOString(),
                                lt: moment.utc(props.ano_captura).add(1, 'year').toISOString()
                            } : {}
                        }
                    ],
                    OR: [
                        {
                            rch_empleados: {
                                matricula: props.matricula ? parseInt(props.matricula) : {}
                            }
                        },
                        {
                            rch_empleados_rch_permisos_id_suplenteTorch_empleados: {
                                matricula: props.matricula ? parseInt(props.matricula) : {}
                            }
                        }
                    ],
                    cat_permisos: {
                        nombre: { contains: 'ESTRATEGIA' }
                    },
                    deleted_at: null
                },
                select: {
                    id: true,
                    folio: true,
                    fecha_inicio: true,
                    fecha_fin: true,
                    created_at: true,
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
                    },
                    rch_empleados_rch_permisos_id_suplenteTorch_empleados: {
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
                    },
                    rch_empleados_rch_permisos_id_blameTorch_empleados: {
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
                    created_at: 'desc'
                },
                skip: min,
                take: rowsPerPage
            });

            const totalStrategies: number = await db.rch_permisos.count({
                where: {
                    folio: props.folio ? parseInt(props.folio) : {},
                    fecha_inicio: props.fec_inicial ? moment.utc(props.fec_inicial).toISOString() : {},
                    AND: [
                        {
                            created_at: props.fec_captura ? { //FECHA CAPTURA ESTRATEGIA
                                gte: moment.utc(props.fec_captura).toISOString(),
                                lt: moment.utc(props.fec_captura).add(1, 'days').toISOString()
                            } : {}
                        },
                        {
                            created_at: props.ano_captura ? { //AÑO DE CAPTURA
                                gte: moment.utc(props.ano_captura).toISOString(),
                                lt: moment.utc(props.ano_captura).add(1, 'year').toISOString()
                            } : {}
                        }
                    ],
                    OR: [
                        {
                            rch_empleados: {
                                matricula: props.matricula ? parseInt(props.matricula) : {}
                            }
                        },
                        {
                            rch_empleados_rch_permisos_id_suplenteTorch_empleados: {
                                matricula: props.matricula ? parseInt(props.matricula) : {}
                            }
                        }
                    ],
                    cat_permisos: {
                        nombre: { contains: 'ESTRATEGIA' }
                    },
                    deleted_at: null
                }
            });

            resolve({ data: strategies, count: totalStrategies });
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
                    AND: [
                        {
                            OR: [
                                { id_empleado: parseInt(props.employee_id) },
                                { id_suplente: parseInt(props.employee_id) }
                            ]
                        },
                        {
                            OR: [
                                {
                                    fecha_inicio: {
                                        lte: new Date(props.fecha_fin),
                                        gte: new Date(props.fecha_ini)
                                    }
                                },
                                {
                                    fecha_fin: {
                                        lte: new Date(props.fecha_fin),
                                        gte: new Date(props.fecha_ini)
                                    }
                                }
                            ]
                        }
                    ],
                    deleted_at: null
                },
                select: {
                    id: true,
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
            const currentYear = moment.utc().subtract(6, 'hour').format('YYYY'); //timestamp utc-6
            const nextYear = (parseInt(currentYear) + 1).toString();
            let repetedBetween: boolean = false;

            const fetchExistingRange: any = await db.rch_permisos.findMany({
                where: {
                    id_empleado: props.employee_id,
                    id_permiso: props.permission_id,
                    created_at: {
                        gte: moment.utc(currentYear).toISOString(),
                        lt: moment.utc(nextYear).toISOString()
                    },
                    deleted_at: null
                },
                select: {
                    fecha_inicio: true,
                    fecha_fin: true
                }
            });


            if (fetchExistingRange.length > 0) { //validate if permission start date is between range of another one already registered
                fetchExistingRange.forEach((item: any) => {
                    while (moment.utc(item.fecha_inicio).isSameOrBefore(moment.utc(item.fecha_fin))) {
                        if (moment.utc(item.fecha_inicio).format('YYYY-MM-DD') === props.dateInit) {
                            repetedBetween = true
                        }
                        item.fecha_inicio = moment(item.fecha_inicio).add(1, 'day').toISOString()
                    }
                });
            }

            const permissionYear = moment.utc(props.dateInit.split('-')[0]).toISOString();
            const permissionNextYear = (parseInt(permissionYear) + 1).toString();

            const repeated: any = await db.rch_permisos.findFirst({
                where: {
                    OR: [
                        {
                            id_empleado: props.employee_id,
                            id_permiso: props.permission_id,
                            OR: [
                                { fecha_inicio: moment.utc(props.dateInit).toISOString() },
                                { fecha_fin: moment.utc(props.dateInit).toISOString() }
                            ]
                        },
                        {   //validate a strategy cannot have same folium in same year
                            folio: props.folium ? parseInt(props.folium) : null,
                            cat_permisos: { nombre: 'ESTRATEGIA' },
                            fecha_inicio: {
                                gte: moment.utc(permissionYear).toISOString(),
                                lt: moment.utc(permissionNextYear).toISOString()
                            },
                            fecha_fin: {
                                gte: moment.utc(permissionYear).toISOString(),
                                lt: moment.utc(permissionNextYear).toISOString()
                            }
                        }
                    ],
                    deleted_at: null
                }
            });

            if (repeated || repetedBetween) {
                resolve({}); //duplicated entry
            } else {
                let record = await db.rch_permisos.create({
                    data: {
                        folio: props.folium ? parseInt(props.folium) : null,
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

export const getStrategyFoliumQuery = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const currentYear = moment.utc().subtract(6, 'hour').format('YYYY'); //timestamp utc-6
            const nextYear = (parseInt(currentYear) + 1).toString();

            let record = await db.rch_permisos.findMany({
                where: {
                    cat_permisos: {
                        nombre: { contains: 'ESTRATEGIA' }
                    },
                    created_at: {
                        gte: moment.utc(currentYear).toISOString(),
                        lt: moment.utc(nextYear).toISOString()
                    }
                },
                select: {
                    folio: true
                },
                orderBy: {
                    folio: 'desc'
                }
            });

            resolve(record);
        } catch (error) {
            reject(error);
        }
    })
}

export const deletePermissionQuery = (id: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const record = await db.rch_permisos.findUnique({
                where: {
                    id
                }
            });

            record ? (
                await db.rch_permisos.update({
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
import moment from "moment";
import { CreatePermissionQueries, PropsEmployeePermissionsQueries, PropsStrategiesQueries } from "../interfaces/permissions";
import { db } from "../utils/db";
import { PropsFormatoEstrategia } from "../interfaces/reportsQueries";
import _ from "lodash";

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

export const getStrategiesInfoPerId = (id: number): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            let record = await db.rch_permisos.findMany({
                where: {
                    id
                },
                select: {
                    fecha_inicio: true,
                    fecha_fin: true,
                    folio: true,
                    id_empleado: true,
                    ini_horario_titular: true,
                    fin_horario_titular: true,
                    ini_horario_suplente: true,
                    fin_horario_suplente: true,
                    rch_empleados: {
                        select: {
                            matricula: true,
                            hora_entrada: true,
                            hora_salida: true,
                            cmp_persona: {
                                select: {
                                    nombres: true, primer_apellido: true, segundo_apellido: true
                                }
                            },
                            cat_categorias: {
                                select: { nombre: true }
                            },
                            cat_departamentos: { select: { nombre: true } },
                            cat_turnos: { select: { nombre: true } }
                        }
                    },
                    rch_empleados_rch_permisos_id_suplenteTorch_empleados: {
                        select: {
                            matricula: true,
                            hora_entrada: true,
                            hora_salida: true,
                            cmp_persona: {
                                select: {
                                    nombres: true, primer_apellido: true, segundo_apellido: true
                                }
                            },
                            cat_categorias: {
                                select: { nombre: true }
                            },
                            cat_departamentos: { select: { nombre: true } },
                            cat_turnos: { select: { nombre: true } }
                        }
                    }
                }
            });

            resolve({
                dateInit: record[0].fecha_inicio,
                dateFin: moment.utc(record[0].fecha_inicio).format('L') !== moment.utc(record[0].fecha_fin).format('L') ? record[0].fecha_fin : null,
                folium: record[0].folio,
                titular: record[0].rch_empleados,
                suplente: record[0].rch_empleados_rch_permisos_id_suplenteTorch_empleados,
                titularHoraEntrada: record[0].ini_horario_titular != null ? moment.utc(record[0].ini_horario_titular).format('HH:mm') : null,
                titularHoraSalida: record[0].fin_horario_titular != null ? moment.utc(record[0].fin_horario_titular).format('HH:mm') : null,
                substituteHoraEntrada: record[0].ini_horario_suplente != null ? moment.utc(record[0].ini_horario_suplente).format('HH:mm') : null,
                substituteHoraSalida: record[0].fin_horario_suplente != null ? moment.utc(record[0].fin_horario_suplente).format('HH:mm') : null,
                type: 'ESTRATEGIA'
            });
        } catch (error) {
            reject(error);
        }
    })
}

export const getEmployeesPermissionsQuery = ({ ...props }: PropsEmployeePermissionsQueries) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('PERMISOS: ', props.employee_id, props.fecha_ini, props.fecha_fin);
            const newFechaIni = moment.utc(props.fecha_ini).subtract(3, 'months').format('YYYY-MM-DD'); //3 meses antes de margen
            const newFechaFin = moment.utc(props.fecha_ini).add(3, 'months').format('YYYY-MM-DD'); //3 meses despues de margen

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
                                        lte: new Date(newFechaFin),
                                        gte: new Date(newFechaIni)
                                    }
                                },
                                {
                                    fecha_fin: {
                                        lte: new Date(newFechaFin),
                                        gte: new Date(newFechaIni)
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
                    ini_horario_titular: true,
                    fin_horario_titular: true,
                    ini_horario_suplente: true,
                    fin_horario_suplente: true,
                    folio: true,
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

export const getLastFoliumFromYear = (permissionYear: string, permissionNextYear: string, orderBy: any, tipo_empleado: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            let foliumList = [];

            if (tipo_empleado === 'BASE IMSS BIENESTAR') {
                foliumList = await db.rch_permisos.findMany({
                    where: {
                        cat_permisos: { nombre: 'ESTRATEGIA' },
                        fecha_inicio: {
                            gte: moment.utc(permissionYear).toISOString(),
                            lt: moment.utc(permissionNextYear).toISOString()
                        },
                        deleted_at: null,
                        rch_empleados: {
                            cat_tipos_empleado: {
                                nombre: 'BASE IMSS BIENESTAR'
                            }
                        }
                    },
                    select: { folio: true },
                    orderBy: orderBy
                });
            } else {
                foliumList = await db.rch_permisos.findMany({
                    where: {
                        cat_permisos: { nombre: 'ESTRATEGIA' },
                        fecha_inicio: {
                            gte: moment.utc(permissionYear).toISOString(),
                            lt: moment.utc(permissionNextYear).toISOString()
                        },
                        deleted_at: null,
                        NOT: {
                            rch_empleados: {
                                cat_tipos_empleado: {
                                    nombre: 'BASE IMSS BIENESTAR'
                                }
                            }
                        }
                    },
                    select: { folio: true },
                    orderBy: orderBy
                });
            }

            resolve(foliumList);
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

            let repeated: any = await db.rch_permisos.findFirst({
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

            if (repeated && props.folium) {//if permission is registered and is strategy. This sentence is for covering cases where a strategy is created in current year but captured in any other year.
                let empTitular = await db.rch_empleados.findFirst({
                    where: {
                        id: props.employee_id
                    },
                    select: { cat_tipos_empleado: { select: { nombre: true } } }
                });

                let foliumList: any = await getLastFoliumFromYear(permissionYear, permissionNextYear, { folio: 'asc' }, empTitular!.cat_tipos_empleado.nombre);
                let nextFolium: number = 1;
                let isFound: any = {};

                while (isFound) {// while founds foliums
                    isFound = foliumList.find((item: any) => item.folio === nextFolium);
                    isFound && nextFolium++;// suma 1 hasta encontrar uno disponible
                }

                props.folium = nextFolium.toString(); //takes last folium from year and adds 1
                repeated = undefined; //removes repeated sentence for allowing saving in DB
            }

            if (repeated || repetedBetween) {//if general permission is already registered
                resolve({}); //duplicated entry
            } else {
                let record = await db.rch_permisos.create({
                    data: {
                        folio: props.folium ? parseInt(props.folium) : null,
                        fecha_inicio: moment.utc(props.dateInit).toISOString(),
                        fecha_fin: props.dateFin === null ? moment.utc(props.dateInit).toISOString() : moment.utc(props.dateFin).toISOString(),
                        observaciones: props.observations,
                        ini_horario_titular: props.titularHoraEntrada ? moment.utc(props.titularHoraEntrada, 'HH:mm').toISOString() : null,
                        fin_horario_titular: props.titularHoraSalida ? moment.utc(props.titularHoraSalida, 'HH:mm').toISOString() : null,
                        ini_horario_suplente: props.substituteHoraEntrada ? moment.utc(props.substituteHoraEntrada, 'HH:mm').toISOString() : null,
                        fin_horario_suplente: props.substituteHoraSalida ? moment.utc(props.substituteHoraSalida, 'HH:mm').toISOString() : null,
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

export const getStrategyFoliumQuery = (fecha_ini: string, tipo_empleado: string): Promise<number> => {
    return new Promise(async (resolve, reject) => {
        try {
            const currentYear = moment.utc().subtract(6, 'hour').format('YYYY'); //timestamp utc-6
            const permissionYear = fecha_ini.split('-')[0];
            const nextYear = (parseInt(fecha_ini === '' ? currentYear : permissionYear) + 1).toString();
            let nextFolium: number = 1;
            let record = [];

            if (tipo_empleado === 'BASE IMSS BIENESTAR') {
                record = await db.rch_permisos.findMany({
                    where: {
                        cat_permisos: {
                            nombre: { contains: 'ESTRATEGIA' }
                        },
                        fecha_inicio: {
                            gte: moment.utc(fecha_ini === '' ? currentYear : permissionYear).toISOString(),
                            lt: moment.utc(nextYear).toISOString()
                        },
                        rch_empleados: {
                            cat_tipos_empleado: {
                                nombre: 'BASE IMSS BIENESTAR'
                            }
                        },
                        deleted_at: null
                    },
                    select: {
                        folio: true
                    },
                    orderBy: {
                        folio: 'asc'
                    }
                });
            } else {
                record = await db.rch_permisos.findMany({
                    where: {
                        cat_permisos: {
                            nombre: { contains: 'ESTRATEGIA' }
                        },
                        fecha_inicio: {
                            gte: moment.utc(fecha_ini === '' ? currentYear : permissionYear).toISOString(),
                            lt: moment.utc(nextYear).toISOString()
                        },
                        deleted_at: null,
                        NOT: {
                            rch_empleados: {
                                cat_tipos_empleado: {
                                    nombre: 'BASE IMSS BIENESTAR'
                                }
                            }
                        }
                    },
                    select: {
                        folio: true
                    },
                    orderBy: {
                        folio: 'asc'
                    }
                });
            }

            let isFound: any = {};

            while (isFound) {// mientras encuentre folios ya registrados
                isFound = record.find(item => item.folio === nextFolium);
                isFound && nextFolium++;// suma 1 hasta encontrar uno disponible
            }

            resolve(nextFolium);
        } catch (error) {
            reject(error);
        }
    })
}

export const deletePermissionQuery = (id: number, id_blame: number) => {
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
                        id_blame: id_blame,
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
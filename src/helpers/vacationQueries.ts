import moment from "moment";
import { PropsGetTotalVacationQueries, PropsGetVacationQueries } from "../interfaces/vacationQueries";
import { db } from "../utils/db";

export const getVacationQuery = ({ empleado = '', ...props }: PropsGetVacationQueries) => {
    return new Promise(async (resolve, reject) => {
        try {
            const rowsPerPage = parseInt(props.limit);
            const min = ((parseInt(props.page) + 1) * rowsPerPage) - rowsPerPage;

            let em = empleado.split(' ');

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
                    tipo: props.tipo ? { contains: props.tipo } : {},
                    rol: props.rol ? { contains: props.rol } : {},
                    fecha_inicio: props.fec_inicial ? moment.utc(props.fec_inicial).toISOString() : {},
                    fecha_fin: props.fec_final ? moment.utc(props.fec_final).toISOString() : {}
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
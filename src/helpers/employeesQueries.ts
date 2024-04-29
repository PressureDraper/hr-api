import { PropsGetEmployeeQueries, SicaEmployeeQueries } from "../interfaces/employeesQueries";
import { db } from "../utils/db";

export const getEmployeePerIdsQuery = (data: PropsGetEmployeeQueries) => {
    return new Promise(async (resolve, reject) => {
        try {
            const empleados = JSON.parse(decodeURIComponent(data.data));
            const array = await Promise.all(
                empleados.map(async (id: number) => {
                    const reg = await db.rch_empleados.findFirst({
                        where: {
                            id
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
                                    curp:true,
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
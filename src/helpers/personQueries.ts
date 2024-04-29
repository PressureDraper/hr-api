import { PropsGetPersonQueries } from "../interfaces/personQueries";
import { db } from "../utils/db";

export const getPersonQuery = (data: PropsGetPersonQueries) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pacientes = JSON.parse(decodeURIComponent(data.data));
            const array = await Promise.all(
                pacientes.map(async (id: number) => {
                    const reg = await db.cmp_persona.findFirst({
                        where: {
                            id
                        },
                        select: {
                            id: true,
                            nombres: true,
                            primer_apellido: true,
                            segundo_apellido: true,
                            curp: true,
                            rfc: true,
                            sexo: true
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
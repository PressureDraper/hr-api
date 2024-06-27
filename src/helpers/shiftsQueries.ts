import { db } from "../utils/db";

export const getShiftsCatalogQuery = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const shifts = await db.cat_turnos.findMany({
                select: {
                   id: true,
                   nombre: true
                },
                orderBy: {
                    id: 'asc'
                }
            });

            resolve(shifts);
        } catch (error) {
            reject(error);
        }
    })
}
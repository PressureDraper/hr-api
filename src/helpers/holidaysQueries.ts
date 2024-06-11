import { PropsGetRangeQueries } from "../interfaces/holidays";
import { db } from "../utils/db";

export const getHolidaysQuery = ({ ...data }: PropsGetRangeQueries) => {
    return new Promise(async (resolve, reject) => {
        try {
            const holidays = await db.cat_festivos.findMany({
                where: {
                    fecha: {
                        lte: new Date(data.fecha_fin),
                        gte: new Date(data.fecha_ini)
                    }
                },
                select: {
                   id: true,
                   descripcion: true,
                   fecha: true 
                },
                orderBy: {
                    id: 'asc'
                }
            });

            resolve(holidays);
        } catch (error) {
            reject(error);
        }
    })
}
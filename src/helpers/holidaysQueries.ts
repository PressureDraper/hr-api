import moment from "moment";
import { PropsCreateHolidaysQueries, PropsGetAllHolidays, PropsGetRangeQueries } from "../interfaces/holidays";
import { db } from "../utils/db";

export const getRangeHolidaysQuery = ({ ...data }: PropsGetRangeQueries) => {
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

export const getAllHolidaysQuery = ({...props}: PropsGetAllHolidays) => {
    return new Promise(async (resolve, reject) => {
        try {
            const rowsPerPage = parseInt(props.limit);
            const min = ((parseInt(props.page) + 1) * rowsPerPage) - rowsPerPage;

            const holidays = await db.cat_festivos.findMany({
                select: {
                    id: true,
                    descripcion: true,
                    fecha: true
                },
                orderBy: {
                    id: 'desc'
                },
                skip: min,
                take: rowsPerPage
            });

            resolve(holidays);
        } catch (error) {
            reject(error);
        }
    })
}

export const getTotalHolidaysQuery = () => {
    return new Promise(async (resolve, reject) => {
        try {

            let countListHolidays = await db.cat_festivos.count({
                where: {
                    deleted_at: null
                }
            });

            countListHolidays ? (

                resolve(countListHolidays)

            ) : resolve(0);
        } catch (error) {
            console.log(error);
            reject(error);
        }
    })
}

export const createHolidayQuery = ({ ...props }: PropsCreateHolidaysQueries) => {
    return new Promise(async (resolve, reject) => {
        try {
            const repeated: any = await db.cat_festivos.findFirst({
                where: {
                    fecha: moment.utc(props.fecha).toISOString()
                }
            });

            if (repeated) {
                resolve({}); //duplicated entry
            } else {
                let record = await db.cat_festivos.create({
                    data: {
                        descripcion: props.descripcion,
                        fecha: moment.utc(props.fecha).toISOString(),
                        created_at: moment.utc().subtract(6, 'hour').toISOString(), //gmt -6,
                        updated_at: moment.utc().subtract(6, 'hour').toISOString(), //gmt -6
                    }
                })
                resolve(record);
            }
        } catch (error) {
            reject(error);
        }
    })
}
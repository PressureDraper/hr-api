import { Response } from "express";
import { getHolidaysQuery } from "../helpers/holidaysQueries";

export const getHolidays = async (req: any, res: Response) => {
    try {
        const params: any = req.query;
        const queryHolidays = await getHolidaysQuery(params);
        res.status(200).json({
            ok: true,
            msg: 'Ok',
            data: queryHolidays
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Server error contact the administrator'
        });
    }
}
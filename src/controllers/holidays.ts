import { Response } from "express";
import { createHolidayQuery, getAllHolidaysQuery, getRangeHolidaysQuery, getTotalHolidaysQuery } from '../helpers/holidaysQueries';
import { PropsCreateHolidaysQueries, PropsGetAllHolidays } from "../interfaces/holidays";

export const getHolidays = async (req: any, res: Response) => {
    try {
        const params: any = req.query;
        const queryHolidays = await getRangeHolidaysQuery(params);
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

export const getAllHolidays = async (req: any, res: Response) => {
    try {
        const params: PropsGetAllHolidays = req.query;
        const allHolidays = await getAllHolidaysQuery({...params});
        res.status(200).json({
            ok: true,
            msg: 'Ok',
            data: allHolidays
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Server error contact the administrator'
        });
    }
}

export const getTotalHolidays = async (req: any, res: Response) => {
    try {
        let queryTotalHolidays = await getTotalHolidaysQuery();

        res.status(200).json({
            ok: true,
            msg: 'ok',
            data: queryTotalHolidays
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Server error contact the administrator'
        });
    }
}

export const createHoliday = async (req: any, res: Response) => {
    try {
        const data: PropsCreateHolidaysQueries = req.body;
        console.log(data);
        
        const query: any = await createHolidayQuery(data);

        if (Object.keys(query).length === 0 ) {
            res.status(409).json({
                ok: false,
                msg: 'Duplicated entry'
            });
        } else {
            res.status(200).json({
                ok: true,
                msg: 'ok',
                data: query
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Server error contact the administrator'
        });
    }
}
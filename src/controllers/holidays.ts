import { Response } from "express";
import { createHolidayQuery, deleteFestivosQuery, getAllHolidaysQuery, getRangeHolidaysQuery, getTotalHolidaysQuery, updateFestivosQuery } from '../helpers/holidaysQueries';
import { PropsCreateHolidaysQueries, PropsGetAllHolidays, PropsUpdateHolidaysQueries } from "../interfaces/holidays";

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

export const updateHoliday = async (req: any, res: Response) => {
    try {
        const id: number = req.params.id;
        const data: PropsUpdateHolidaysQueries = req.body;
        const query = await updateFestivosQuery({ ...data, id });

        res.status(200).json({
            ok: true,
            msg: 'ok',
            data: query
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Server error contact the administrator'
        });
    }
}

export const deleteHoliday = async (req: any, res: Response) => {
    try {
        const id: number = parseInt(req.params.id);
        const state = await deleteFestivosQuery(id);

        state ?
            res.status(200).json({
                ok: true,
                msg: 'Record deleted',
            })
            :
            res.status(404).json({
                ok: false,
                msg: 'Record to delete not found'
            })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Server error contact the administrator'
        });
    }
}
import { Response } from "express";
import { PropsGetTotalVacationQueries, PropsGetVacationQueries } from "../interfaces/vacationQueries";
import { getTotalVacationQuery, getVacationQuery } from "../helpers/vacationQueries";

export const getVacation = async (req: any, res: Response) => {
    try {
        const params: PropsGetVacationQueries = req.query;
        let queryVacation = await getVacationQuery({ ...params });
        res.status(200).json({
            ok: true,
            msg: 'Ok',
            data: queryVacation
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Server error contact the administrator'
        });
    }
}

export const getTotalVacation = async (req: any, res: Response) => {
    try {
        const params: PropsGetTotalVacationQueries = req.query;
        let queryTotalVacation = await getTotalVacationQuery({...params});
        
        res.status(200).json({
            ok: true,
            msg: 'ok',
            data: queryTotalVacation
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Server error contact the administrator'
        });
    }
}
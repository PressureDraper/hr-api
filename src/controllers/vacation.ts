import { Response } from "express";
import { PropsGetTotalVacationQueries, PropsGetVacationQueries, PropsUpdateVacationQueries } from "../interfaces/vacationQueries";
import { deleteVacationQuery, getTotalVacationQuery, getVacationQuery, updateVacationQuery } from "../helpers/vacationQueries";

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
        let queryTotalVacation = await getTotalVacationQuery({ ...params });

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

export const updateVacation = async (req: any, res: Response) => {
    try {
        const id: number = req.params.id;
        const data: PropsUpdateVacationQueries = req.body;
        const query = await updateVacationQuery({...data, id});

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

export const deleteVacation = async (req: any, res: Response) => {
    try {
        const id: number = parseInt(req.params.id);
        const state = await deleteVacationQuery(id);

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
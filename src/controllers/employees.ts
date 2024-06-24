import { Response } from "express";
import { createShiftHistoryQuery, getEmployeePerIdsQuery, getEmployeeQuery, getKardexQuery } from "../helpers/employeesQueries";
import { SicaEmployeeQueries, shiftsHistoryQueries } from "../interfaces/employeesQueries";

export const getEmployeePerIdsData = async (req: any, res: Response) => {
    try {
        const params: any = req.query;
        const queryEmpleado = await getEmployeePerIdsQuery(params);
        res.status(200).json({
            ok: true,
            msg: 'Ok',
            data: queryEmpleado
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Server error contact the administrator'
        });
    }
}

export const getEmployee = async (req: any, res: Response) => {
    try {
        const params: SicaEmployeeQueries = req.query;
        const listEmployee = await getEmployeeQuery({ ...params });

        res.status(200).json({
            ok: true,
            msg: 'Ok',
            data: listEmployee
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Server error contact the administrator'
        });
    }
}

export const getKardex = async (req: any, res: Response) => {
    try {
        const id: number = parseInt(req.query.id);
        
        const data = await getKardexQuery(id);

        res.status(200).json({
            ok: true,
            msg: 'Ok',
            data: data
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Server error contact the administrator'
        });
    }
}

export const createShiftHistory = async (req: any, res: Response) => {
    try {
        const data: shiftsHistoryQueries = req.body;
        const record: any = await createShiftHistoryQuery({ ...data });

        if (Object.keys(record).length === 0) {
            res.status(409).json({
                ok: false,
                msg: 'Incoming entry is already created!'
            })
        } else {
            res.status(200).json({
                ok: true,
                msg: 'ok',
                data: record
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Server error contact the administrator'
        });
    }
}
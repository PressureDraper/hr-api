import { Response } from "express";
import { getShiftsQuery } from "../helpers/shiftsQueries";

export const getShifts = async (req: any, res: Response) => {
    try {
        const shifts = await getShiftsQuery();
        res.status(200).json({
            ok: true,
            msg: 'Ok',
            data: shifts
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Server error contact the administrator'
        });
    }
}
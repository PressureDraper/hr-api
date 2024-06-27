import { Response } from "express";
import { getShiftsCatalogQuery } from "../helpers/shiftsQueries";

export const getShifts = async (req: any, res: Response) => {
    try {
        const shiftsCatalog = await getShiftsCatalogQuery();
        res.status(200).json({
            ok: true,
            msg: 'Ok',
            data: shiftsCatalog
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Server error contact the administrator'
        });
    }
}
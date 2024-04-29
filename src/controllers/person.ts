import { Response } from "express";
import { getPersonQuery } from "../helpers/personQueries";

export const getPersonData = async (req: any, res: Response) => {
    try {
        const params: any = req.query;
        const queryPaciente = await getPersonQuery(params);
        res.status(200).json({
            ok: true,
            msg: 'Ok',
            data: queryPaciente
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Server error contact the administrator'
        });
    }
}
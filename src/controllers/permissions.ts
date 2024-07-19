import { Response } from "express";
import { getCatPermissionsQuery } from "../helpers/permissionsQueries";

export const getPermissions = async (req: any, res: Response) => {
    try {
        const queryPermissions = await getCatPermissionsQuery();
        
        res.status(200).json({
            ok: true,
            msg: 'Ok',
            data: queryPermissions
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Server error contact the administrator'
        });
    }
}
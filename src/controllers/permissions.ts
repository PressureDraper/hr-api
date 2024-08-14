import { Response } from "express";
import { createPermissionPerEmployeeQuery, getCatPermissionsQuery, getEmployeesPermissionsQuery, getPermissionDetailsQuery } from "../helpers/permissionsQueries";
import { CreatePermissionQueries, PropsEmployeePermissionsQueries } from "../interfaces/permissions";

export const getCatPermissions = async (req: any, res: Response) => {
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

export const getEmployeesPermissions = async (req: any, res: Response) => {
    try {
        const data: PropsEmployeePermissionsQueries = req.query;
        const queryPermissions = await getEmployeesPermissionsQuery({...data});

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

export const getPermissionDetails = async (req: any, res: Response) => {
    try {
        const { created_at }: any = req.query;
        const queryDetails = await getPermissionDetailsQuery(created_at);

        res.status(200).json({
            ok: true,
            msg: 'Ok',
            data: queryDetails
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Server error contact the administrator'
        });
    }
}

export const createPermissionPerEmployee = async (req: any, res: Response) => {
    try {
        const data: CreatePermissionQueries = req.body;
        const record: any = await createPermissionPerEmployeeQuery({ ...data });

        console.log(data);

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
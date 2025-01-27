import { Response } from "express";
import { createPermissionPerEmployeeQuery, deletePermissionQuery, getCatPermissionsQuery, getEconomicosPerYearQuery, getEmployeesPermissionsQuery, getStrategiesInfoQuery, getStrategyFoliumQuery } from '../helpers/permissionsQueries';
import { CreatePermissionQueries, PropsEmployeePermissionsQueries, PropsStrategiesQueries } from "../interfaces/permissions";

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
        const queryPermissions = await getEmployeesPermissionsQuery({ ...data });

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

export const getStrategiesInfo = async (req: any, res: Response) => {
    try {
        const data: PropsStrategiesQueries = req.query;
        const queryStrategies = await getStrategiesInfoQuery({ ...data });

        res.status(200).json({
            ok: true,
            msg: 'Ok',
            data: queryStrategies.data,
            count: queryStrategies.count
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Server error contact the administrator'
        });
    }
}

export const getEconomicosPerYear = async (req: any, res: Response) => {
    try {
        const id: string = req.query.id;
        const queryDetails = await getEconomicosPerYearQuery(id);

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

export const getStrategyFoliumPerYearQuery = async (req: any, res: Response) => {
    try {
        const query = await getStrategyFoliumQuery();

        res.status(200).json({
            ok: true,
            msg: 'Ok',
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

export const createPermissionPerEmployee = async (req: any, res: Response) => {
    try {
        const data: CreatePermissionQueries = req.body;

        if ((data.folium === undefined && data.permission_id === 40) || data.folium === null && data.permission_id === 40) {
            res.status(400).json({
                ok: false,
                msg: 'Capture el folio de estrategia'
            })
        } else {
            const record: any = await createPermissionPerEmployeeQuery({ ...data });

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
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Server error contact the administrator'
        });
    }
}

export const deletePermission = async (req: any, res: Response) => {
    try {
        const id: number = parseInt(req.params.id);
        const state = await deletePermissionQuery(id);

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
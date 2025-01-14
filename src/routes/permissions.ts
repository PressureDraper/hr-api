import { Router } from "express";
import { createPermissionPerEmployee, deletePermission, getCatPermissions, getEconomicosPerYear, getEmployeesPermissions, getStrategiesInfo, getStrategyFoliumPerYearQuery } from "../controllers/permissions";

const router: Router = Router();

router.get('/', getCatPermissions);
router.get('/strategies', getStrategiesInfo);
router.get('/employeesPermissions', getEmployeesPermissions); //relacion de permisos por empleado para reflejar en el calendario y data del eventClick del permiso
router.get('/count/economicos', getEconomicosPerYear);
router.get('/folios', getStrategyFoliumPerYearQuery);

router.post('/create', createPermissionPerEmployee);

router.delete('/:id', deletePermission);

export default router;
import { Router } from "express";
import { createPermissionPerEmployee, getCatPermissions, getEconomicosPerYear, getEmployeesPermissions, getPermissionDetails } from "../controllers/permissions";

const router: Router = Router();

router.get('/', getCatPermissions);
router.get('/employeesPermissions', getEmployeesPermissions); //relacion de permisos por empleado
router.get('/permissionDetails', getPermissionDetails); //relacion de los detalles del evento eventClick en el calendario
router.get('/count/economicos', getEconomicosPerYear);

router.post('/create', createPermissionPerEmployee);

export default router;
import { Router } from "express";
import { createPermissionPerEmployee, getCatPermissions, getEconomicosPerYear, getEmployeesPermissions } from "../controllers/permissions";

const router: Router = Router();

router.get('/', getCatPermissions);
router.get('/employeesPermissions', getEmployeesPermissions); //relacion de permisos por empleado para reflejar en el calendario y data del eventClick del permiso
router.get('/count/economicos', getEconomicosPerYear);

router.post('/create', createPermissionPerEmployee);

export default router;
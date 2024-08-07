import { Router } from "express";
import { createPermissionPerEmployee, getCatPermissions, getEmployeesPermissions, getPermissionDetails } from "../controllers/permissions";

const router: Router = Router();

router.get('/', getCatPermissions);
router.get('/employeesPermissions', getEmployeesPermissions); //relacion de permisos por empleado
router.get('/permissionDetails', getPermissionDetails); //relacion de los detalles del evento eventClick en el calendario

router.post('/create', createPermissionPerEmployee);

export default router;
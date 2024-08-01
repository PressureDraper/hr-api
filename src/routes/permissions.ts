import { Router } from "express";
import { createPermissionPerEmployee, getCatPermissions } from "../controllers/permissions";

const router: Router = Router();

router.get('/', getCatPermissions);
/* router.get('/employeesPermissions', getEmployeesPermissions); //relacion de permisos por empleado */

router.post('/create', createPermissionPerEmployee);

export default router;
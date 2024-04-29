import { Router } from "express";
import { check } from "express-validator";
import { getEmployee, getEmployeePerIdsData } from "../controllers/employees";

const router: Router = Router();

router.get('/', getEmployeePerIdsData); //get per ids's array
router.get('/filter', getEmployee) // get per enrollment or name

export default router;
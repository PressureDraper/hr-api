import { Router } from "express";
import { check } from "express-validator";
import { createShiftHistory, getEmployee, getEmployeePerIdsData, getKardex } from "../controllers/employees";

const router: Router = Router();

router.get('/', getEmployeePerIdsData); //get per ids's array
router.get('/filter', getEmployee); // get per enrollment or name
router.get('/kardex', getKardex);

router.post('/shiftHistory', createShiftHistory);

export default router;
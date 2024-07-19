import { Router } from "express";
import { createShiftHistory, getEmployee, getEmployeePerIdsData, getEmployeeType, getKardex } from "../controllers/employees";

const router: Router = Router();

router.get('/', getEmployeePerIdsData); //get per ids's array
router.get('/filter', getEmployee); // get per enrollment or name
router.get('/kardex', getKardex);
router.get('/types', getEmployeeType)

router.post('/shiftHistory', createShiftHistory);

export default router;
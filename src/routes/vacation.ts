import { Router } from "express";
import { createVacation, deleteVacation, getTotalVacation, getVacation, getVacationPerEmployeeId, updateVacation } from "../controllers/vacation";

const router: Router = Router();

router.get('/', getVacation);
router.get('/employee', getVacationPerEmployeeId);
router.get('/total/count', getTotalVacation);

router.post('/', createVacation);

router.put('/:id', updateVacation);

router.delete('/:id', deleteVacation);

export default router;
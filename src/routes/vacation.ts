import { Router } from "express";
import { check } from "express-validator";
import { createVacation, deleteVacation, getTotalVacation, getVacation, updateVacation } from "../controllers/vacation";

const router: Router = Router();

router.get('/', getVacation);
router.get('/total/count', getTotalVacation);

router.post('/', createVacation);

router.put('/:id', updateVacation);

router.delete('/:id', deleteVacation);

export default router;
import { Router } from "express";
import { check } from "express-validator";
import { getTotalVacation, getVacation } from "../controllers/vacation";

const router: Router = Router();

router.get('/', getVacation);
router.get('/total/count', getTotalVacation);

export default router;
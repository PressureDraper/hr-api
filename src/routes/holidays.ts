import { Router } from "express";
import { createHoliday, getAllHolidays, getHolidays, getTotalHolidays } from "../controllers/holidays";

const router: Router = Router();

router.get('/', getHolidays);
router.get('/all', getAllHolidays);
router.get('/total', getTotalHolidays);

router.post('/', createHoliday);

export default router;
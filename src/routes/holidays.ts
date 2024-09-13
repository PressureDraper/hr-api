import { Router } from "express";
import { createHoliday, deleteHoliday, getAllHolidays, getHolidays, getTotalHolidays, updateHoliday } from "../controllers/holidays";

const router: Router = Router();

router.get('/', getHolidays);
router.get('/all', getAllHolidays);
router.get('/total', getTotalHolidays);

router.post('/', createHoliday);

router.put('/:id', updateHoliday);

router.delete('/:id', deleteHoliday)

export default router;
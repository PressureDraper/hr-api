import { Router } from "express";
import { getHolidays } from "../controllers/holidays";

const router: Router = Router();

router.get('/', getHolidays);

export default router;
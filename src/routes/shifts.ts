import { Router } from "express";
import { getShifts } from "../controllers/shifts";

const router: Router = Router();

router.get('/', getShifts);

export default router;
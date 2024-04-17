import { Router } from "express";
import { check } from "express-validator";
import { getVacation } from "../controllers/vacation";

const router: Router = Router();

router.get('/', getVacation);

export default router;
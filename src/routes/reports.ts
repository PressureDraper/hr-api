import { Router } from "express";
import { getExcelChecadas } from "../controllers/reports";

const router: Router = Router();

router.get('/checadas', getExcelChecadas);

export default router;
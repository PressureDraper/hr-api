import { Router } from "express";
import { getExcelChecadas, getPdfEstrategia } from "../controllers/reports";

const router: Router = Router();

router.get('/checadas', getExcelChecadas);
router.get('/formatoEstrategia', getPdfEstrategia);

export default router;
import { Router } from "express";
import { generareReportIms, getExcelChecadas, getPdfEstrategia } from "../controllers/reports";

const router: Router = Router();

router.get('/checadas', getExcelChecadas);
router.get('/formatoEstrategia', getPdfEstrategia);
router.get('/ims_report', generareReportIms);

export default router;
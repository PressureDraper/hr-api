import { Router } from "express";
import { getExcelChecadas, getPdfEstrategia, generareReportIms, printPdfEstrategia } from "../controllers/reports";

const router: Router = Router();

router.get('/checadas', getExcelChecadas);
router.get('/formatoEstrategia', getPdfEstrategia);
router.get('/printEstrategia', printPdfEstrategia);
router.get('/ims_report', generareReportIms);

export default router;
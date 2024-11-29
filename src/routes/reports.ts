import { Router } from "express";
import { getExcelChecadas, getPdfEstrategia, getIncidencias, generareReportIms } from "../controllers/reports";

const router: Router = Router();

router.get('/checadas', getExcelChecadas);
router.get('/formatoEstrategia', getPdfEstrategia);
router.get('/ims_report', generareReportIms);

router.get('/incidencias', getIncidencias) //endpoint used for LF236. Not generates a report

export default router;
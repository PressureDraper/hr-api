import { Router } from "express";
import { SingController } from "../controllers/sign.controller";
import { SignService } from "../controllers/presentation/services/sign.service";
import { FileUploadMiddleware } from "../controllers/presentation/middlewares/file-upload.middleware";
const service = new SignService();
const router: Router = Router();

const controller = new SingController(service);

router.get('/', controller.getSign);
router.get('/:id', controller.getOne);
router.get('/history/get/:id', controller.getHistory);
router.post('/', [FileUploadMiddleware.containFile], controller.createSing);
router.put('/', [FileUploadMiddleware.containFile], controller.updateSign)
router.delete('/:id', controller.deleteSign);

export default router;
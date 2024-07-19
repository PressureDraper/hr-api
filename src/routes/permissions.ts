import { Router } from "express";
import { getPermissions } from "../controllers/permissions";

const router: Router = Router();

router.get('/', getPermissions);

export default router;
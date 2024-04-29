import { Router } from "express";
import { check } from "express-validator";
import { getPersonData } from "../controllers/person";

const router: Router = Router();

router.get('/', getPersonData);

export default router;
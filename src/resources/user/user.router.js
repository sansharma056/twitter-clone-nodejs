import { Router } from "express";
import { getOne } from "./user.controller";

const router = Router();

router.get("/:screenName", getOne);

export default router;

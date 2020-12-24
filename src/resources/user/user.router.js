import { Router } from "express";
import { getOne, updateOne } from "./user.controller";

const router = Router();

router.get("/:screenName", getOne);
router.put("/:screenName", updateOne);
export default router;

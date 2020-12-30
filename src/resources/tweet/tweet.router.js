import { Router } from "express";
import { createOne, getOne } from "./tweet.controller";

const router = Router();

router.post("/", createOne);
router.get("/:id", getOne);

export default router;

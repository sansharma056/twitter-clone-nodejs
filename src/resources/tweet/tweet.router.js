import { Router } from "express";
import { createOne, deleteOne, getOne, getMany } from "./tweet.controller";

const router = Router();

router.post("/", createOne);
router.get("/", getMany);
router.get("/:id", getOne);
router.delete("/:id", deleteOne);

export default router;

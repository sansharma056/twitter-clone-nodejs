import { Router } from "express";
import {
  createOne,
  deleteOne,
  getOne,
  getMany,
  validateTweetId,
} from "./tweet.controller";
import favoriteRouter from "./favorite/favorite.router";

const router = Router();

router.post("/", createOne);

router.use("/:id", validateTweetId);

router.get("/", getMany);
router.get("/:id", getOne);
router.use("/:id/favorite", favoriteRouter);
router.delete("/:id", deleteOne);

export default router;

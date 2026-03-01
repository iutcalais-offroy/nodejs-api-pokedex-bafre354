import { Router } from "express";
import { getCards } from "../controllers/cards.controller";

const router = Router();

router.get("/", getCards);

export default router;
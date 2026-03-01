import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createDeck,
  getMyDecks,
  getDeckById,
  updateDeck,
  deleteDeck,
} from "../controllers/decks.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", createDeck);
router.get("/mine", getMyDecks);
router.get("/:id", getDeckById);
router.patch("/:id", updateDeck);
router.delete("/:id", deleteDeck);

export default router;
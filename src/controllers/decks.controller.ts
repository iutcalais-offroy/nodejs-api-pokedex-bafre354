import { Request, Response } from "express";
import { prisma } from "../database";

export const createDeck = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { name, cards } = req.body;

    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    if (!cards || !Array.isArray(cards) || cards.length !== 10) {
      res.status(400).json({ error: "Deck must contain exactly 10 cards" });
      return;
    }

    const existingCards = await prisma.card.findMany({
      where: { id: { in: cards } },
    });

    if (existingCards.length !== 10) {
      res.status(400).json({ error: "Some card IDs are invalid" });
      return;
    }

    const deck = await prisma.deck.create({
      data: {
        name,
        userID: userId,
        deckCards: {
          createMany: {
            data: cards.map((cardId: number, idx: number) => ({
              cardID: cardId,
              position: idx + 1, // required by schema
            })),
          },
        },
      },
      include: {
        deckCards: {
          include: { card: true },
        },
      },
    });

    res.status(201).json(deck);
  } catch (error) {
    console.error("Create deck error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMyDecks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;

    const decks = await prisma.deck.findMany({
      where: { userID: userId },
      include: {
        deckCards: {
          include: { card: true },
        },
      },
    });

    res.status(200).json(decks);
  } catch (error) {
    console.error("Get my decks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDeckById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const deckId = Number(req.params.id);

    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      include: {
        deckCards: {
          include: { card: true },
        },
      },
    });

    if (!deck) {
      res.status(404).json({ error: "Deck not found" });
      return;
    }

    if (deck.userID !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    res.status(200).json(deck);
  } catch (error) {
    console.error("Get deck by id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateDeck = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const deckId = Number(req.params.id);
    const { name, cards } = req.body;

    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
    });

    if (!deck) {
      res.status(404).json({ error: "Deck not found" });
      return;
    }

    if (deck.userID !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    if (cards) {
      if (!Array.isArray(cards) || cards.length !== 10) {
        res.status(400).json({ error: "Deck must contain exactly 10 cards" });
        return;
      }

      const existingCards = await prisma.card.findMany({
        where: { id: { in: cards } },
      });

      if (existingCards.length !== 10) {
        res.status(400).json({ error: "Some card IDs are invalid" });
        return;
      }

      await prisma.deckcard.deleteMany({
        where: { deckID: deckId },
      });

      await prisma.deckcard.createMany({
        data: cards.map((cardId: number, idx: number) => ({
          deckID: deckId,
          cardID: cardId,
          position: idx + 1,
        })),
      });
    }

    const updatedDeck = await prisma.deck.update({
      where: { id: deckId },
      data: {
        name: name ?? deck.name,
      },
      include: {
        deckCards: {
          include: { card: true },
        },
      },
    });

    res.status(200).json(updatedDeck);
  } catch (error) {
    console.error("Update deck error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteDeck = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const deckId = Number(req.params.id);

    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
    });

    if (!deck) {
      res.status(404).json({ error: "Deck not found" });
      return;
    }

    if (deck.userID !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    await prisma.deckcard.deleteMany({
      where: { deckID: deckId },
    });

    await prisma.deck.delete({
      where: { id: deckId },
    });

    res.status(200).json({ message: "Deck deleted successfully" });
  } catch (error) {
    console.error("Delete deck error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
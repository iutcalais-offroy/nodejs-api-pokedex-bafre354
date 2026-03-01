import { Request, Response } from "express";
import { prisma } from "../database";

export const getCards = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cards = await prisma.card.findMany({
      orderBy: {
        pokedexNumber: "asc",
      },
    });

    res.status(200).json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

import bcrypt from "bcryptjs";
import {readFileSync} from "fs";
import {join} from "path";
import {prisma} from "../src/database";
import {CardModel} from "../src/generated/prisma/models/Card";
import {PokemonType} from "../src/generated/prisma/enums";


/* La fonction principale de cette étape de seed. Le fonctionnement est assez simple :
    - On mélange toutes les cartes du tableau en faisant une copie du tableau original
    - On choisit les 10 premiers éléments du tableau mélangé
*/
function pickRandomUnique<T>(arr: T[], count: number): T[] {
  if (count > arr.length) {
    throw new Error(`Not enough items to pick ${count} unique elements.`);
  }

  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

async function createStarterDeckForUser(userId: number, userName: string) {
  // On crée un deck vide pour l'utilisateur
  const deck = await prisma.deck.create({
    data: {
      name: "Starter Deck",
      userID: userId,
    },
  });

  // Maintenant, on récupres les cartes de la bd à tarvers leurs ID
  const allCards = await prisma.card.findMany({
    select: { id: true },
  });

  if (allCards.length < 10) {
    throw new Error(`Not enough cards in DB to create a 10-card deck (found ${allCards.length}).`);
  }

  // Choisis 10 cartes aléatoires uniques (Pas de doublons)
  const picked = pickRandomUnique(allCards, 10);

  // Insert les cartes choisis suivant un positionnement de 1 à 10
  await prisma.deckcard.createMany({
    data: picked.map((c, idx) => ({
      deckID: deck.id,
      cardID: c.id,
      position: idx + 1,
    })),
  });

  console.log(`✅ Created Starter Deck for ${userName} with 10 random cards`);
}

async function main() {
    console.log("🌱 Starting database seed...");

    await prisma.card.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash("password123", 10);

    await prisma.user.createMany({
        data: [
            {
                username: "red",
                email: "red@example.com",
                password: hashedPassword,
            },
            {
                username: "blue",
                email: "blue@example.com",
                password: hashedPassword,
            },
        ],
    });

    const redUser = await prisma.user.findUnique({where: {email: "red@example.com"}});
    const blueUser = await prisma.user.findUnique({where: {email: "blue@example.com"}});

    if (!redUser || !blueUser) {
        throw new Error("Failed to create users");
    }

    console.log("✅ Created users:", redUser.username, blueUser.username);

    const pokemonDataPath = join(__dirname, "data", "pokemon.json");
    const pokemonJson = readFileSync(pokemonDataPath, "utf-8");
    const pokemonData: CardModel[] = JSON.parse(pokemonJson);

    const createdCards = await Promise.all(
        pokemonData.map((pokemon) =>
            prisma.card.create({
                data: {
                    name: pokemon.name,
                    hp: pokemon.hp,
                    attack: pokemon.attack,
                    type: PokemonType[pokemon.type as keyof typeof PokemonType],
                    pokedexNumber: pokemon.pokedexNumber,
                    imgUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.pokedexNumber}.png`,
                },
            })
        )
    );

    console.log(`✅ Created ${pokemonData.length} Pokemon cards`);

    await createStarterDeckForUser(redUser.id, redUser.username);
    await createStarterDeckForUser(blueUser.id, blueUser.username)

    console.log("\n🎉 Database seeding completed!");
}

main()
    .catch((e) => {
        console.error("❌ Error seeding database:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

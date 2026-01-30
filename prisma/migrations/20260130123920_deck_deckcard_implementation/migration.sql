-- CreateTable
CREATE TABLE "Deck" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userID" INTEGER NOT NULL,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deckcard" (
    "id" SERIAL NOT NULL,
    "deckID" INTEGER NOT NULL,
    "cardID" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "Deckcard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Deck_name_key" ON "Deck"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Deckcard_deckID_position_key" ON "Deckcard"("deckID", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Deckcard_deckID_cardID_key" ON "Deckcard"("deckID", "cardID");

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deckcard" ADD CONSTRAINT "Deckcard_deckID_fkey" FOREIGN KEY ("deckID") REFERENCES "Deck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deckcard" ADD CONSTRAINT "Deckcard_cardID_fkey" FOREIGN KEY ("cardID") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

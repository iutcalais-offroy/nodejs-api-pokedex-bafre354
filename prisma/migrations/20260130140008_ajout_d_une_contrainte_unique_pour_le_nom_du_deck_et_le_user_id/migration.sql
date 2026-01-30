/*
  Warnings:

  - A unique constraint covering the columns `[userID,name]` on the table `Deck` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Deck_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Deck_userID_name_key" ON "Deck"("userID", "name");

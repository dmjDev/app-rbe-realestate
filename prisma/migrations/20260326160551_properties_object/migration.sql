/*
  Warnings:

  - A unique constraint covering the columns `[itemId]` on the table `properties` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "properties_itemId_key" ON "properties"("itemId");

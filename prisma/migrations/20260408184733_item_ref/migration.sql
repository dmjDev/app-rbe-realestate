/*
  Warnings:

  - A unique constraint covering the columns `[itemRef]` on the table `items` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `itemRef` to the `items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "items" ADD COLUMN     "itemRef" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "items_itemRef_key" ON "items"("itemRef");

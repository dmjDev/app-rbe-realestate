/*
  Warnings:

  - Added the required column `updatedAt` to the `itemssaved` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "itemssaved" ADD COLUMN     "state" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

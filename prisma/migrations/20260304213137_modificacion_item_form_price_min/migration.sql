/*
  Warnings:

  - Added the required column `priceMin` to the `properties` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "priceMin" DOUBLE PRECISION NOT NULL;

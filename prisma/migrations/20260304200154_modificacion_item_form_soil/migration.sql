/*
  Warnings:

  - You are about to drop the column `floorMaterial` on the `properties` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FlooringType" AS ENUM ('LAMINATED', 'VINILIC', 'WOOD', 'STONE', 'PORCELAIN', 'HIDRAULIC', 'MICROCEMENT');

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "floorMaterial",
ADD COLUMN     "flooringMaterial" "FlooringType";

-- DropEnum
DROP TYPE "FloorType";

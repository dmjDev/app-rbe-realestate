/*
  Warnings:

  - The values [Hardwood,Laminate,Vinyl,CeramicTile,PorcelainTile,Marble,Granite,PolishedConcrete,Travertine,Carpet,NaturalStone,Terrazo,Bamboo] on the enum `FlooringType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `post` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FlooringType_new" AS ENUM ('HARDWOOD', 'LAMINATE', 'VINYL', 'CERAMICTILE', 'PORCELAINTILE', 'MARBLE', 'GRANITE', 'POLISHEDCONCRETE', 'TRAVERTINE', 'CARPET', 'NATURALSTONE', 'TERRAZO', 'BAMBOO');
ALTER TABLE "properties" ALTER COLUMN "flooringMaterial" TYPE "FlooringType_new" USING ("flooringMaterial"::text::"FlooringType_new");
ALTER TYPE "FlooringType" RENAME TO "FlooringType_old";
ALTER TYPE "FlooringType_new" RENAME TO "FlooringType";
DROP TYPE "public"."FlooringType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "post" DROP CONSTRAINT "post_authorId_fkey";

-- DropTable
DROP TABLE "post";

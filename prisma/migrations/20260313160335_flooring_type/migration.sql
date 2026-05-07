/*
  Warnings:

  - The values [LAMINATED,VINILIC,WOOD,STONE,PORCELAIN,HIDRAULIC,MICROCEMENT] on the enum `FlooringType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FlooringType_new" AS ENUM ('Hardwood', 'Laminate', 'Vinyl', 'CeramicTile', 'PorcelainTile', 'Marble', 'Granite', 'PolishedConcrete', 'Travertine', 'Carpet', 'NaturalStone', 'Terrazo', 'Bamboo');
ALTER TABLE "properties" ALTER COLUMN "flooringMaterial" TYPE "FlooringType_new" USING ("flooringMaterial"::text::"FlooringType_new");
ALTER TYPE "FlooringType" RENAME TO "FlooringType_old";
ALTER TYPE "FlooringType_new" RENAME TO "FlooringType";
DROP TYPE "public"."FlooringType_old";
COMMIT;

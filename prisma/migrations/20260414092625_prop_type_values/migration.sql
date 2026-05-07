/*
  Warnings:

  - The values [HOUSE,LOCAL,GARAGE,STORAGE,OFFICE] on the enum `PropertyType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PropertyType_new" AS ENUM ('FLAT', 'APARTMENT', 'PENTHOUSE', 'DUPLEX', 'STUDIO', 'TERRACED_HOUSES', 'DETACHED_CHALETS', 'VILLAS', 'COTTAGE', 'BUNGALOW', 'LOFT', 'ROOMS', 'COMMERCIAL_PROPERTIES', 'GARAGES', 'STORAGE_ROOMS', 'LAND', 'OFFICES', 'BUILDINGS');
ALTER TABLE "properties" ALTER COLUMN "propType" TYPE "PropertyType_new" USING ("propType"::text::"PropertyType_new");
ALTER TYPE "PropertyType" RENAME TO "PropertyType_old";
ALTER TYPE "PropertyType_new" RENAME TO "PropertyType";
DROP TYPE "public"."PropertyType_old";
COMMIT;

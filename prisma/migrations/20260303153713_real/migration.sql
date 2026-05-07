/*
  Warnings:

  - Added the required column `updatedAt` to the `post` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('SALE', 'RENT', 'SHARE', 'TRANSFER');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('FLAT', 'HOUSE', 'PENTHOUSE', 'DUPLEX', 'STUDIO', 'LOCAL', 'GARAGE', 'STORAGE', 'LAND', 'OFFICE');

-- CreateEnum
CREATE TYPE "EnergyRating" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'PENDING');

-- CreateEnum
CREATE TYPE "Orientation" AS ENUM ('N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO');

-- CreateEnum
CREATE TYPE "FloorType" AS ENUM ('LAMINATED', 'VINILIC', 'WOOD', 'STONE', 'PORCELAIN', 'HIDRAULIC', 'MICROCEMENT');

-- AlterTable
ALTER TABLE "post" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "mediaUrl" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "operation" "OperationType" NOT NULL,
    "type" "PropertyType" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "isNewDevelopment" BOOLEAN NOT NULL DEFAULT false,
    "province" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "neighborhood" TEXT,
    "streetName" TEXT,
    "streetNumber" TEXT,
    "floor" TEXT,
    "isExterior" BOOLEAN NOT NULL DEFAULT true,
    "showAddress" BOOLEAN NOT NULL DEFAULT false,
    "orientation" "Orientation",
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "builtSize" DOUBLE PRECISION NOT NULL,
    "usefulSize" DOUBLE PRECISION,
    "rooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "floorMaterial" "FloorType",
    "hasLift" BOOLEAN NOT NULL DEFAULT false,
    "hasGarden" BOOLEAN NOT NULL DEFAULT false,
    "hasPool" BOOLEAN NOT NULL DEFAULT false,
    "hasTerrace" BOOLEAN NOT NULL DEFAULT false,
    "hasBalcony" BOOLEAN NOT NULL DEFAULT false,
    "hasStorageRoom" BOOLEAN NOT NULL DEFAULT false,
    "hasGarage" BOOLEAN NOT NULL DEFAULT false,
    "isFurnished" BOOLEAN NOT NULL DEFAULT false,
    "floatingFloor" BOOLEAN NOT NULL DEFAULT false,
    "centralHeating" BOOLEAN NOT NULL DEFAULT false,
    "underfloorHeating" BOOLEAN NOT NULL DEFAULT false,
    "ductedAirc" BOOLEAN NOT NULL DEFAULT false,
    "splitsAirc" BOOLEAN NOT NULL DEFAULT false,
    "climalitWindow" BOOLEAN NOT NULL DEFAULT false,
    "thermalBridgeWindow" BOOLEAN NOT NULL DEFAULT false,
    "electricBlinds" BOOLEAN NOT NULL DEFAULT false,
    "premiumAppliance" BOOLEAN NOT NULL DEFAULT false,
    "seaSight" BOOLEAN NOT NULL DEFAULT false,
    "mountainSight" BOOLEAN NOT NULL DEFAULT false,
    "culturalSight" BOOLEAN NOT NULL DEFAULT false,
    "commonRooms" BOOLEAN NOT NULL DEFAULT false,
    "commonPool" BOOLEAN NOT NULL DEFAULT false,
    "commonGym" BOOLEAN NOT NULL DEFAULT false,
    "padelArea" BOOLEAN NOT NULL DEFAULT false,
    "childrenArea" BOOLEAN NOT NULL DEFAULT false,
    "socialArea" BOOLEAN NOT NULL DEFAULT false,
    "goalkeeper" BOOLEAN NOT NULL DEFAULT false,
    "securityCameras" BOOLEAN NOT NULL DEFAULT false,
    "alarm" BOOLEAN NOT NULL DEFAULT false,
    "accesibility" BOOLEAN NOT NULL DEFAULT false,
    "energyRating" "EnergyRating" NOT NULL DEFAULT 'PENDING',
    "emissionsRating" "EnergyRating" NOT NULL DEFAULT 'PENDING',
    "images" TEXT[],
    "videoUrl" TEXT,
    "virtualTourUrl" TEXT,
    "description" TEXT NOT NULL,
    "communityCosts" DOUBLE PRECISION,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itemssaved" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itemssaved_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itemchats" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "clientId" TEXT,
    "managerId" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itemchats_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itemssaved" ADD CONSTRAINT "itemssaved_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itemssaved" ADD CONSTRAINT "itemssaved_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itemchats" ADD CONSTRAINT "itemchats_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itemchats" ADD CONSTRAINT "itemchats_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itemchats" ADD CONSTRAINT "itemchats_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

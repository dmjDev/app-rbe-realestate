/*
  Warnings:

  - You are about to drop the column `images` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `operation` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `properties` table. All the data in the column will be lost.
  - Added the required column `operType` to the `properties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `propType` to the `properties` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "properties" DROP COLUMN "images",
DROP COLUMN "operation",
DROP COLUMN "type",
ADD COLUMN     "imgUrl" TEXT[],
ADD COLUMN     "operType" "OperationType" NOT NULL,
ADD COLUMN     "propType" "PropertyType" NOT NULL;

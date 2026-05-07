/*
  Warnings:

  - Added the required column `frequencyPay` to the `properties` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FrequencyPay" AS ENUM ('DAILY', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY', 'ANNUALLY');

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "frequencyPay" "FrequencyPay" NOT NULL;

-- DropEnum
DROP TYPE "frequencyPay";

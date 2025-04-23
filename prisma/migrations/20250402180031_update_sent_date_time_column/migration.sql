/*
  Warnings:

  - A unique constraint covering the columns `[pcode]` on the table `participants` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "participants" ALTER COLUMN "pcode" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "participants_pcode_key" ON "participants"("pcode");

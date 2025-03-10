/*
  Warnings:

  - You are about to alter the column `name` on the `participants` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `phone` on the `participants` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE "participants" ALTER COLUMN "name" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "phone" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "created" DROP DEFAULT,
ALTER COLUMN "created" SET DATA TYPE TEXT,
ALTER COLUMN "modified" SET DATA TYPE TEXT;

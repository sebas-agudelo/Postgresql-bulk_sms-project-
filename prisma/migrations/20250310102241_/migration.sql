/*
  Warnings:

  - You are about to drop the column `datetime` on the `participants` table. All the data in the column will be lost.
  - You are about to drop the column `smsCost` on the `participants` table. All the data in the column will be lost.
  - You are about to drop the column `smsParts` on the `participants` table. All the data in the column will be lost.
  - The `created` column on the `participants` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `modified` column on the `participants` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "bulk_sms_users" ADD COLUMN     "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "modified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "participants" DROP COLUMN "datetime",
DROP COLUMN "smsCost",
DROP COLUMN "smsParts",
ADD COLUMN     "sent_date_time" VARCHAR(100),
ADD COLUMN     "sms_cost" VARCHAR(50),
ADD COLUMN     "sms_created_time" VARCHAR(100),
ADD COLUMN     "sms_id" VARCHAR(200),
ADD COLUMN     "sms_parts" VARCHAR(50),
ADD COLUMN     "userId" TEXT,
DROP COLUMN "created",
ADD COLUMN     "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "modified",
ADD COLUMN     "modified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

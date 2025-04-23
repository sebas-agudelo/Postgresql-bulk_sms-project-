/*
  Warnings:

  - You are about to drop the column `couponSend` on the `participants` table. All the data in the column will be lost.
  - Added the required column `campaign_id` to the `bulk_sms_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bulk_sms_users" ADD COLUMN     "campaign_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "participants" DROP COLUMN "couponSend",
ADD COLUMN     "coupon_sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sms_sent" BOOLEAN NOT NULL DEFAULT false;

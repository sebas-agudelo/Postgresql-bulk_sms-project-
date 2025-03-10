/*
  Warnings:

  - You are about to drop the `bulk_sms` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "bulk_sms";

-- CreateTable
CREATE TABLE "bulk_sms_users" (
    "id" TEXT NOT NULL,
    "profileName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "scheduleDate" VARCHAR(100) NOT NULL,

    CONSTRAINT "bulk_sms_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "couponSend" INTEGER NOT NULL DEFAULT 0,
    "smsParts" VARCHAR(50) NOT NULL,
    "smsCost" VARCHAR(50) NOT NULL,
    "datetime" VARCHAR(100) NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

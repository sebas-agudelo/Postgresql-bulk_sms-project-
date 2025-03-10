-- CreateTable
CREATE TABLE "bulk_sms" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "scheduleDate" VARCHAR(100) NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "couponSend" BOOLEAN NOT NULL DEFAULT false,
    "smsParts" VARCHAR(50) NOT NULL,
    "smsCost" VARCHAR(50) NOT NULL,
    "datetime" VARCHAR(100) NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bulk_sms_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "bulk_sms_users" ALTER COLUMN "modified" DROP NOT NULL;

-- AlterTable
ALTER TABLE "participants" ALTER COLUMN "modified" DROP NOT NULL;

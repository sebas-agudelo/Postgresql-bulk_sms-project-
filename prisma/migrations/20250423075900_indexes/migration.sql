-- CreateIndex
CREATE INDEX "bulk_sms_users_campaign_id_profileName_scheduleDate_created_idx" ON "bulk_sms_users"("campaign_id", "profileName", "scheduleDate", "created");

-- CreateIndex
CREATE INDEX "participants_pcode_created_idx" ON "participants"("pcode", "created");

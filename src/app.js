import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from "@prisma/client";
import fs from 'fs'; 

const app = express();
app.use(express.json());

dotenv.config();

const prisma = new PrismaClient();

const participants = fs.readFileSync('src/json/participants.json', 'utf-8');
const participants_data = JSON.parse(participants).data;

app.post('/payload', async (req, res) => {
    participants_data.forEach(async (allData) => {
        
        const { profileName, message, scheduleDate, participants: participantList } = allData;

        const user = await prisma.bulk_sms_users.create({
            data: {
                profileName: profileName,
                message: message,
                scheduleDate: scheduleDate,
                created: new Date()
            }
        });

        participantList.forEach(async (participant) => {
            await prisma.participants.create({
                data: {
                    userId: user.id, 
                    name: participant.name,
                    phone: participant.phone,
                    couponSend: 0,
                    sms_parts: "0", 
                    sms_cost: "0", 
                    sent_date_time: "",
                    sms_created_time: "",
                    sms_id: "",
                    created: new Date()
                }
            });
        });
    });

    res.status(200).json({ message: "Data successfully saved!" });
});

app.listen(process.env.PORT, () => {
    console.log("Server running on port 3000");
});

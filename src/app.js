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

app.get('/payload', async (req, res) => {
    const user = await prisma.bulk_sms_users.create({
        data: {
            profileName: "TestUser",
            message: "Hi there",
            scheduleDate: "25-03-07 12:00:00",
            created: new Date()
        }
    })

    participants_data.forEach( async (participant ) => {
       
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
        })
        
        
    })
})

app.listen(process.env.PORT, () => {
    console.log("Servern är igång i porten 3000");
    
})
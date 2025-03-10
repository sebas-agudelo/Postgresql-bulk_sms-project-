import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from "@prisma/client";
import fs from 'fs'; 



const app = express();
app.use(express.json());

dotenv.config();

const prisma = new PrismaClient();

const participants = fs.readFileSync('src/json/participants.json', 'utf-8');
const user_data = JSON.parse(participants)
const participants_data = JSON.parse(participants).data;

app.post('/payload', async (req, res) => {
    const user = await prisma.bulk_sms_users.create({
        data: {
            profileName: user_data.profileName,
            message: user_data.message,
            scheduleDate: user_data.scheduledTime,
            created: new Date()
        }
    })

    participants_data.forEach( async (participant ) => {
       
        await prisma.participants.create({
            
            data: {
                userId: user.id,
                name: participant.name,
                phone: participant.phone,
                created: new Date()

            }
        })
        
        
    })
})

app.listen(process.env.PORT, () => {
    console.log("Servern är igång i porten 3000");
    
})
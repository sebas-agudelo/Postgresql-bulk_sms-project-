import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import {users_data} from '../json/user_data.js'

dotenv.config();

const participants_data = users_data.data;

const prisma = new PrismaClient();

let FailedData = [];
let FinalFailedData = [];

export const insertUsersData = async (req, res) => {
      try {
        const user = await prisma.bulk_sms_users.create({
          data: {
            profileName: users_data.profileName,
            message: users_data.message,
            campaign_id: users_data.campaign_id,
            scheduleDate: users_data.scheduledTime,
            created: new Date(),
          },
        });        
    
        for (const participant of participants_data) {
          try {
            await prisma.participants.create({
              data: {
                userId: user.id,
                name: participant.name,
                phone: participant.phone,
                created: new Date(),
              },
            });
          } catch (error) {
            console.error(error);
            FailedData.push({
              name: participant.name,
              phone: participant.phone,
            });
          }
        };
    
        for (const failed_participants of FailedData) {
          try {
            await prisma.participants.create({
              data: {
                userId: user.id,
                name: failed_participants.name,
                phone: failed_participants.phone,
                created: new Date(),
              },
            });
          } catch (error) {
            console.error(error);
            FinalFailedData.push(failed_participants);
          }
        }
    
        if (FinalFailedData.length > 0) {
          return res.status(400).json({
            message: `Something went wrong with one or more participants, at the first and second attempt`,
            failedParticipants: FinalFailedData,
          });
        }
    
        return res
          .status(200)
          .json("The data has been inserted into the database.");
      } catch (error) {
        console.log(error);
        
        return res.status(500).json({ error: "Something went wrong", error});
      }
};

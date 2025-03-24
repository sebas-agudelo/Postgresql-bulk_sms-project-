import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const updateSmsData = async (sms_id, estimated_cost, sms_parts, participantId) => {

    try {
      const update = await prisma.participants.update({
        where: {
          id: participantId,
        },
        data: {
            sms_id: sms_id,
            sms_cost: estimated_cost.toString(),
            sms_parts: sms_parts.toString(),
            modified: new Date(),
        },
      });
  
      // console.log('Uppdatering av SMS-data:', update);
      await prisma.$disconnect();
      return update;
    } catch (error) {
      console.error("Något gick fel med att uppdatera deltagaren ---->", error);
    }
  };
  

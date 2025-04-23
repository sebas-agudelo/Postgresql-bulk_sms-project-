import { prisma } from '../../prisma/prismaClient.js'

export const updateSmsData = async (sms_id, estimated_cost, sms_parts, to, participantId) => {
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
            coupon_sent: true,
            sms_sent: true
        },
      });

      await prisma.$disconnect();
      return update;
    } catch (error) {
      console.error("Något gick fel med att uppdatera deltagaren ---->", error);
    }
  };
  

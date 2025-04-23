import { prisma } from "../../prisma/prismaClient.js";

//Get Participants By Page
export const getParticipantsByPage = async (req, res) => {
  const { profileName, campaignId, scheuledDate } = req.body;
  const page = 1;
  const pageSize = 50;
  try {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    const countParticipants = await prisma.participants.count();
    const TotalNumberofPages = Math.ceil(countParticipants / pageSize);

    const users = await prisma.bulk_sms_users.findMany({
        where: {
            profileName: profileName,
            campaign_id: campaignId,
            scheduleDate: scheuledDate,
          },
      select: {
        id: true,
      },
    });
    const userIds = users.map((user) => user.id);

    const participantsData = await prisma.participants.findMany({
      where: {
        userId: { in: userIds },
      },
      skip: page - 1,
      take: pageSize,
    });

    //
    if(participantsData.length === 0){
        return res
        .status(200)
        .json({message: "Inga participants hittades...."})
    }

    let p_code = participantsData.map((p) => p.id);

    p_code = p_code.map(() => {
      let newId = "";
      for (let i = 0; i < 5; i++) {
        newId += chars[Math.floor(Math.random() * chars.length)];
      }
      return newId;
    });

    for (let i = 0; i < participantsData.length; i++) {
      let p = participantsData[i];

      let newId = p_code[i];
      await prisma.participants.update({
        where: { id: p.id },
        data: {
          pcode: newId,
        },
      });
    }

    return res.status(200).json({
      data: participantsData,
      startPage: page,
      endPage: TotalNumberofPages,
    });
  } catch (error) {
    console.error("SERVER ERROR - Get Participants By Page", error);
    return res.status(500).json({ error: "Ett oväntat fel har inträffat...." });
  }
};

//Get All Participants Data
export const getAllParticipantsData = async (req, res) => {
  try {
    const getUserId = await prisma.bulk_sms_users.findMany({
      select: { id: true },
    });

    const userIds = getUserId.map((user) => user.id);

    const participants = await prisma.participants.findMany({
      where: {
        userId: { in: userIds },
        sms_cost: { not: null },
        sms_parts: { not: null },
      },
      select: {
        userId: true,
        id: true,
        sms_parts: true,
        sms_sent: true,
        sms_cost: true,
      },
    });

    const result = participants.reduce(
      (acc, participant) => {
        const { id, sms_cost, sms_parts, sms_sent } = participant;
        const participantsCount = id;
        const smsCost = parseInt(sms_cost);
        const smsCount = sms_parts;
        const smsParts = sms_sent;

        if (participantsCount) {
          acc.participantsCount++;
        }

        if (smsCost) {
          acc.smsCost =
            Math.round((acc.smsCost += smsCost / 10000) * 100) / 100;
        }

        if (smsCount === "1") {
          acc.smsCount++;
        }

        if (smsParts === true) {
          acc.smsParts++;
        }

        return acc;
      },
      {
        participantsCount: 0,
        smsCost: 0,
        smsCount: 0,
        smsParts: 0,
      }
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("SERVER ERROR - Get All Participants Data", error);
    return res.status(500).json({ error: "Ett oväntat fel har inträffat...." });
  }
};

//get Participant By Pcode
export const getParticipantByPcode = async (req, res) => {
  const { pcode } = req.params;
  try {
    const participant = await prisma.participants.findUnique({
      where: { pcode: pcode },
    });

    if (!participant) {
      return res.status(404).json({
        error: "Deltagaren kunde inte hittas. Försök igen",
      });
    }

    return res.status(200).json({
      participant: participant,
    });
  } catch (err) {
    console.error("Något har gått fel status 500", err);
  }
};

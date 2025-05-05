import { prisma } from "../../prisma/prismaClient.js";

//Get Participants By Page
export const getParticipantsByPage = async (req, res) => {
  const { profileName, campaignId, scheuledDate, page } = req.body;
  const laPage = page;
  const pageSize = 400;
  try {
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

    const skip = (laPage - 1) * pageSize;

    const participantsData = await prisma.participants.findMany({
      where: {
        userId: { in: userIds },
      },
      skip,
      take: pageSize,
      orderBy: {
        created: "asc",
      }
    });

    if (participantsData.length === 0) {
      return res
        .status(200)
        .json({ message: "Inga participants hittades...." });
    };

    return res.status(200).json({
      data: participantsData,
      startPage: page,
      endPage: TotalNumberofPages,
    });
  } catch (error) {
    console.error("SERVER ERROR - Get Participants By Page", error);
    return res.status(500).json({ error: "Ett oväntat fel har inträffat...." });
  };
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

    const lll = [];
    
    lll.push(result)

    return res.status(200).json({data: lll});
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

import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { insertUsersData } from "./db_insert/insert_data.js";
import { rabbitmq_producer } from "./rabbitmq/producer.js";
import { rabbitmq_consumer } from "./rabbitmq/coscumer.js";

dotenv.config();

const app = express();
app.use(express.json());

const prisma = new PrismaClient();

app.post("/payload", async (req, res) => {
    try {
        await insertUsersData(req, res);
    } catch (error) {
        console.error("Fel vid insertUsersData:", error);
        return res.status(500).json({ error: "Fel vid insättning av data" });
    }

  try {
    await rabbitmq_producer();
  } catch (error) {
    console.error("Fel vid RabbitMQ:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Kunde inte skicka till RabbitMQ" });
    }
  }
});

const startConsumer = async () => {
  setTimeout(async () => {
    try {
      await rabbitmq_consumer();
    } catch (error) {
      console.error(
        "Fel vid anslutning, försöker igen om 10 sekunder ---->",
        error
      );
      startConsumer();
    }
  }, 10000);
};

startConsumer();

app.post('/getParticipantsByPage', async (req, res) => {
  const page = req.body.pageId || 1;
  const pageSize = 500;

  try{
    const countParticipants = await prisma.participants.count();
    const totalPages = Math.ceil(countParticipants / pageSize);

    console.log("Totala sidor", totalPages);
    
    const participantsData = await prisma.participants.findMany({
      skip: (page - 1),
      take: pageSize
    })
    
    return res.status(200).json({
      message: `Alla deltagare har hämtats... Totala deltagare: ${participantsData.length}`,
      data: participantsData,
      startPage: page,
      endPage: totalPages
    })
    
  }catch(err){
    console.error("Något har gått fel status 500", err); 
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servern är igång --> PORT: ${PORT}`);
});

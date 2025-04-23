import express from "express";
import dotenv from "dotenv";
import { insertUsersData } from "./db_insert/insert_data.js";
import { rabbitmq_producer } from "./rabbitmq/producer.js";
import { rabbitmq_consumer } from "./rabbitmq/coscumer.js";
import { prisma } from "../prisma/prismaClient.js";
import { getAllParticipantsData, getParticipantsByPage, getParticipantByPcode } from "./apiControllers/apiControllers.js";

dotenv.config();

const app = express();
app.use(express.json());

app.post('/getParticipantsByPage', getParticipantsByPage);
app.get('/getAllParticipantsData', getAllParticipantsData);
app.post('/getParticipantByPcode', getParticipantByPcode);


app.post("/payload", async (req, res) => {
  // try {
  //   await insertUsersData(req, res);
  // } catch (error) {
  //   console.error("Fel vid insertUsersData:", error);
  //   return res.status(500).json({ error: "Fel vid insättning av data" });
  // }

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servern är igång --> PORT: ${PORT}`);
});

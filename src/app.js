import express from "express";
import dotenv from "dotenv";
import { insertUsersData } from "./db_insert/insert_data.js";
import { rabbitmq_producer } from "./rabbitmq/producer.js";
import { rabbitmq_coscumer } from "./rabbitmq/coscumer.js";

dotenv.config();

const app = express();
app.use(express.json());
 
app.post('/payload', async (req, res) => {
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

  // await rabbitmq_coscumer();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servern är igång --> PORT: ${PORT}`);
});

import amqp from "amqplib";
import { PrismaClient } from "@prisma/client";
import { sendSms } from "../46elks/46elks_sms_sendout.js";

const rabbitmqUrl = `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@${process.env.RABBITMQ_HOST}:5672`;
const prisma = new PrismaClient();

export const rabbitmq_consumer = async () => {
  const exchange = "delayed_exchange";
  const queue = "participants_queue";
  const routingKey = "participants";
  const batchSize = 1000; 
  let batchCounter = 0;
  let currentBatch = [];

  const connection = await amqp.connect(rabbitmqUrl);
  const channel = await connection.createChannel();

  await channel.assertExchange(exchange, "x-delayed-message", {
    durable: true,
    arguments: { "x-delayed-type": "direct" },
  });

  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, routingKey);

  console.log("Konsumenten väntar på fördröjda meddelanden...");

  const processMessage = async (msg) => {
    try {
      const participant_data = JSON.parse(msg.content.toString());
      console.log("Meddelande mottaget");

      if (!participant_data || !participant_data.id) {
        console.log("Datan från rabbitmq producer med deltagar ID är tom....");
        channel.ack(msg);
        return;
      }

      const participant = await prisma.participants.findUnique({
        where: { id: participant_data.id },
        select: {
          id: true,
          phone: true,
          userId: true,
        },
      });

      if (!participant || !participant.id) {
        console.log("Finns inga deltagare att hämta baserat på deltagar-ID....");
        channel.ack(msg);
        return;
      }

      const user_data = await prisma.bulk_sms_users.findUnique({
        where: { id: participant.userId },
        select: {
          id: true,
          profileName: true,
          message: true,
        },
      });

      if (!user_data || !user_data.id) {
        console.log("Finns ingen användare att hämta baserat på användar-ID....");
        channel.ack(msg);
        return;
      }

      await sendSms(
        user_data.profileName, 
        participant.phone, 
        user_data.message, 
        participant.id
      );

      channel.ack(msg);
    } catch (error) {
      console.error("Fel vid bearbetning av meddelande:", error);
      channel.nack(msg, false, false);
    }
  };

  const processBatchSequentially = async (batch) => {
    for (const msg of batch) {
      await processMessage(msg); 
    }
    batchCounter ++;
    console.log("Antal batchar som skickats", batchCounter);
  };

  channel.consume(
    queue,
    async (msg) => {
      if (msg) {
        currentBatch.push(msg);  
        if (currentBatch.length >= batchSize) {
          const batchToProcess = [...currentBatch];
          currentBatch = [];
          await processBatchSequentially(batchToProcess); 
        }
      }
    },
    { noAck: false }
  );
};
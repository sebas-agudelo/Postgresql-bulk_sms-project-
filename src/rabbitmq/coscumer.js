import amqp from "amqplib";
import { PrismaClient } from "@prisma/client";
import { sendSms } from "../46elks/46elks_sms_sendout.js";

const rabbitmqUrl = `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@${process.env.RABBITMQ_HOST}:5672`;
const prisma = new PrismaClient();

export const rabbitmq_consumer = async () => {
  const exchange = "delayed_exchange";
  const queue = "participants_queue";
  const routingKey = "participants";
  const batchSize = 50;
  let batch = [];

  const connection = await amqp.connect(rabbitmqUrl);
  const channel = await connection.createChannel();

  await channel.assertExchange(exchange, "x-delayed-message", {
    durable: true,
    arguments: { "x-delayed-type": "direct" },
  });

  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, routingKey);

  console.log("Konsumenten väntar på fördröjda meddelanden...");

  channel.consume(
    queue,
    async (msg) => {
      if (msg) {
        try {
          const participant_data = JSON.parse(msg.content.toString());

          if (!participant_data || !participant_data.id){
            console.log(
              "Datan från rabbitmq producer med deltagar ID är tom...."
            );
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
            console.log(
              "Finns inga deltagare att hämta baserad på deltar ID:et...."
            );
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

          if (!user_data || !user_data.id){
            console.log(
              "Finns ingen användare att hämta baserad på användar ID:et från participants...."
            );
            return;
          };

          batch.push({
            profileName: user_data.profileName,
            phone: participant.phone,
            message: user_data.message,
            participant_id: participant.id
          })

          if(batch.length >= batchSize){
            await sendBatchSms(batch);
            batch = [];
          }
          
          channel.ack(msg)

        } catch (error) {
          console.error("Fel vid bearbetning av meddelande:", error);
        }
      }
    },
    { noAck: false }
  );
};

const sendBatchSms = async (batch) => {
  try {
    for (let sms of batch) {
      await sendSms(sms.profileName, sms.phone, sms.message, sms.participant_id, true);
    }
  } catch (error) {
    console.error("Fel vid batchutskick av SMS:", error);
  }
};

import amqp from "amqplib";
import { PrismaClient } from "@prisma/client";
import { sendSms } from "../46elks/46elks_sms_sendout.js";

const rabbitmqUrl = `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@${process.env.RABBITMQ_HOST}:5672`;
const prisma = new PrismaClient();

export const rabbitmq_consumer = async () => {
  const exchange = "delayed_exchange";
  const queue = "participants_queue";
  const routingKey = "participants";

  try {
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();

    await channel.assertExchange(exchange, "x-delayed-message", {
      durable: true,
      arguments: { "x-delayed-type": "direct" },
    });

    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);

    channel.prefetch(500); 

    console.log("Konsumenten väntar på meddelanden...");

    channel.consume(
      queue,
      async (msg) => {
        if (msg) {
          try {
            const participant_data = JSON.parse(msg.content.toString());
            console.log(`Mottagit deltagar-ID: ${participant_data.id}`);

            if (!participant_data?.id) {
              console.log("Tomt deltagar-ID, ignorerar meddelande..");
              channel.ack(msg);
              return;
            }

            const participant = await prisma.participants.findUnique({
              where: { id: participant_data.id },
              select: { id: true, phone: true, userId: true },
            });

            if (!participant) {
              console.log("Deltagaren hittades inte.");
              channel.ack(msg);
              return;
            }

            const user_data = await prisma.bulk_sms_users.findUnique({
              where: { id: participant.userId },
              select: { profileName: true, message: true },
            });

            if (!user_data) {
              console.log("Användaren hittades inte.");
              channel.ack(msg);
              return;
            }

            await sendSms(user_data.profileName, participant.phone, user_data.message, participant.id, true);
            console.log(`SMS skickat till: ${participant.phone}`);

            channel.ack(msg); 
          } catch (error) {
            console.error("Fel vid bearbetning av meddelande:", error);
            channel.nack(msg, false, true); 
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("Fel vid anslutning till RabbitMQ:", error);
  }
};


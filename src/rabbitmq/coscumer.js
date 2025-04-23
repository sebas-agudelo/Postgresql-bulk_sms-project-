import amqp from "amqplib";
import { sendSms } from "../46elks/46elks_sms_sendout.js";
import { prisma } from "../../prisma/prismaClient.js";

const rabbitmqUrl = `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@${process.env.RABBITMQ_HOST}:5672`;

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
              select: { id: true, phone: true, userId: true, pcode: true, coupon_sent: true, sms_sent: true },
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

            let updatedMessage = user_data.message;

            if (user_data.message.includes("{landing_url}")) {
              updatedMessage = user_data.message.replace(
                /{landing_url}/g,
                `${user_data.profileName}.${process.env.domainName}.com/c/${participant.pcode}`
              );
            }

            if (!user_data) {
              console.log("Användaren hittades inte.");
              channel.ack(msg);
              return;
            }

            await sendSms(
              user_data.profileName,
              participant.phone,
              updatedMessage,
              participant.id,
              participant.coupon_sent,
              participant.sms_sent,
              true
            );

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

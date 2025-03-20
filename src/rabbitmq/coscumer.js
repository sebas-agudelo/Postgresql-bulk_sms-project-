import amqp from "amqplib";
import { PrismaClient } from "@prisma/client";

const rabbitmqUrl = `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@${process.env.RABBITMQ_HOST}:5672`;
const prisma = new PrismaClient();

export const rabbitmq_consumer = async () => {
  const exchange = "delayed_exchange";
  const queue = "participants_queue";
  const routingKey = "participants";

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
          const participant_data = msg.content.toString();
          const ids = participant_data.id;

          const participant = await prisma.participants.findMany({
            where: { id: ids },
          });

          console.log("Hämtade deltagare:", participant);

          const user_id = participant.map(p => p.userId);

          console.log("Alla userId",user_id);
          
          const users_message = await prisma.bulk_sms_users.findMany({
            where: { 
              id: {in: user_id}
             },
            select: {
              message: true
            }
          })

          console.log("Hämtade message:", users_message);

          channel.ack(msg);
        } catch (error) {
          console.error("Fel vid bearbetning av meddelande:", error);
        }
      }
    },
    { noAck: false }
  );
};

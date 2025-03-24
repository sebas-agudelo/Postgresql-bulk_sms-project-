import amqp from "amqplib";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rabbitmqUrl = `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@${process.env.RABBITMQ_HOST}:5672`;

export const rabbitmq_producer = async () => {
  const exchange = "delayed_exchange";
  const queue = "participants_queue";
  const routingKey = "participants";

  try {
    const current_date = new Date().toISOString();

    const bulkUsers = await prisma.bulk_sms_users.findMany({
      where: {
        scheduleDate: {
          gte: current_date,
        },
      },
      select: { id: true, scheduleDate: true },
      distinct: "id",
    });

    const scheduleMap = new Map();
    bulkUsers.forEach((entry) => {
      scheduleMap.set(entry.id, new Date(entry.scheduleDate));
    });

    const participants = await prisma.participants.findMany({
      where: {
        userId: { in: bulkUsers.map((user) => user.id) },
      },
      select: {
        id: true,
        userId: true,
      },
    });

    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();

    await channel.assertExchange(exchange, "x-delayed-message", {
      durable: true,
      arguments: { "x-delayed-type": "direct" },
    });

    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);

    const now = new Date();
    for (const participant of participants) {
      const scheduleDate = scheduleMap.get(participant.userId);
      if (!scheduleDate) continue;

      const delay = scheduleDate - now;

      const message = JSON.stringify({ id: participant.id });

      channel.publish(exchange, routingKey, Buffer.from(message), {
        persistent: true,
        headers: { "x-delay": delay },
      });

      console.log(
        `Skickade participant ID ${participant.id} med ${delay}ms fördröjning`
      );
    }

    await channel.close();
    await connection.close();
    await prisma.$disconnect();
  } catch (error) {
    console.error("Error vid RabbitMQ-produktion:", error);
  }
};

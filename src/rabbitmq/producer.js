import amqp from "amqplib";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rabbitmqUrl = `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@${process.env.RABBITMQ_HOST}:5672`;
let participant_ids;

const getParticipants = async () => {
  try {
    const get_participants = await prisma.participants.findMany({
      select: {
        id: true,
      },
    });

    participant_ids = get_participants;
    console.log(participant_ids);
  } catch (error) {
    console.error(
      "Kunde inte hämta användaren kolla på följande fel ---> ",
      error
    );
  }
};

export const rabbitmq_producer = async () => {
  const queue = "participants";

  await getParticipants();

  try {
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: true });

    for (const participant of participant_ids) {
      const partcipant_ids_message = JSON.stringify(participant);
      channel.sendToQueue(queue, Buffer.from(partcipant_ids_message), {
        persistent: true
      });
    }

    console.log("Meddelandet har skickats till RabbitMQ:");

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Error al conectar a RabbitMQ:", error);
  }
};

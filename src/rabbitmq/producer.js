import amqp from "amqplib";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rabbitmqUrl = `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@${process.env.RABBITMQ_HOST}:5672`;
let participant_ids;
let the_delay; 

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
    console.error("Kunde inte hämta användaren kolla på följande fel ---> ", error);
  }
};

export const getScheduleDate = async () => {
  try{
    const get_schedule_date = await prisma.bulk_sms_users.findMany({
      select: {
        scheduleDate: true
      }
    });

    if(get_schedule_date.length === 0){
      console.log(`Finns inga schedule datum att hämta`);
      return
    }

    const schedule_date = new Date(get_schedule_date[0].scheduleDate);
    const current_date = new Date();
    the_delay = schedule_date - current_date;
    
    console.log(the_delay);
    
  }catch(error){
    console.error("Kunde inte hämta schedule date kolla på följande fel ---> ", error);
    
  }
}

export const rabbitmq_producer = async () => {
  const exchange = "delayed_exchange";
  const queue = "participants_queue";
  const routingKey = "participants"; 

  await getParticipants();
  await getScheduleDate();

  try {
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();

    await channel.assertExchange(exchange, "x-delayed-message", {
      durable: true,
      arguments: { "x-delayed-type": "direct" },
    });

    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);

    for (const participant of participant_ids) {
      const partcipant_ids_message = JSON.stringify({
        id: participant.id,
      });

      const delay = 5000;

      channel.publish(exchange, routingKey, Buffer.from(partcipant_ids_message), {
        persistent: true,
        headers: { "x-delay": delay },
      });
      
      console.log(`Meddelande skickat med ${delay}ms fördröjning:`, participant);
    }

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Error al conectar a RabbitMQ:", error);
  }
};

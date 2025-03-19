import amqp from "amqplib";

const rabbitmqUrl = `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@${process.env.RABBITMQ_HOST}:5672`;

export const rabbitmq_consumer = async () => {
  const exchange = "delayed_exchange";
  const queue = "participants_queue";
  const routingKey = 'participants';

  const connection = await amqp.connect(rabbitmqUrl);
  const channel = await connection.createChannel();

  await channel.assertExchange(exchange, "x-delayed-message", {
    durable: true,
    arguments: { "x-delayed-type": "direct" }
  });

  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, routingKey);

  console.log("Konsumenten väntar på fördröjda meddelanden...");

  channel.consume(queue, (msg) => {
    if (msg) {
      console.log(`Mottaget efter fördröjning: ${msg.content.toString()}`);
      channel.ack(msg);
    }
  }, { noAck: false });
};



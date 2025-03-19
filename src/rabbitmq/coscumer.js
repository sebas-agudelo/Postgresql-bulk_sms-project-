import amqp from "amqplib";

const rabbitmqUrl = `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@${process.env.RABBITMQ_HOST}:5672`;

export const rabbitmq_coscumer = async () => {
    const queue = 'participants';
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: true });

    console.log(`Väntar på att ta emot meddelandet från queue ${queue}`);

    channel.consume(queue, (msg) => {
        console.log(`✅ Meddelande mottaget: ${msg.content.toString()}`);
    }, { noAck: false });
} 


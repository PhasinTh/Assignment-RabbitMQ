import amqplib, { Channel, Connection } from 'amqplib'

const exchange = 'order_exchange'
let channel: Channel, connection: Connection

async function boostrap() {
    try {
        const amqpServer = 'amqp://localhost:5672'
        connection = await amqplib.connect(amqpServer)
        channel = await connection.createChannel()
        await channel.assertExchange(exchange, 'direct')
        const queue = await channel.assertQueue('', {
            exclusive: true
        })
        
        console.log(`[*] Waiting for food orders. To exit press CTRL+C`);
        channel.bindQueue(queue.queue, exchange, 'Drink');

        channel.consume(queue.queue,
            function (msg: amqplib.ConsumeMessage | null) {
                console.log(msg!.content.toString());
            },
            { noAck: true }
        );
    } catch (error) {
        console.log(error)
    }
}

boostrap()
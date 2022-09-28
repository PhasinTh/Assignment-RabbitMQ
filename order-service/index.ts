import amqplib, { Channel, Connection } from 'amqplib'
import express, { Request, Response } from 'express'

const app = express()

app.use(express.json())

const PORT = 5000
const exchange = 'order_exchange'
let channel: Channel, connection: Connection

async function connect() {
  try {
    const amqpServer = 'amqp://localhost:5672'
    connection = await amqplib.connect(amqpServer)
    channel = await connection.createChannel()
    await channel.assertExchange(exchange, 'direct')
  } catch (error) {
    console.log(error)
  }
}
connect()

app.post('/orders', (req: Request, res: Response) => {
  const data = req.body
  console.log(`Submit ${data.type} order`)
  channel.publish(
    exchange,
    data.type,
    Buffer.from(
      JSON.stringify({
        ...data,
        date: new Date(),
      }),
    ),
  )
  res.json('submitted')
})

app.get('*', (req: Request, res: Response) => {
  res.status(404).json('Not found')
})

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
})

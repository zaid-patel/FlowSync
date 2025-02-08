import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

const TOPIC_NAME="zap-events";

const client=new PrismaClient();


const kafka=new Kafka({
    clientId:"outbox-processor1",
    brokers: ['localhost:9092']
})

async function main() {
    const producer=kafka.producer();
    await producer.connect();

    while(1){
       
        
        const pendingRows= await client.zapRunOutbox.findMany({
            where:{},
            take:10
        })


        producer.send({
            topic:TOPIC_NAME,
            messages:pendingRows.map((e)=>{
                return {
                    value: JSON.stringify({zapRunId:e.zapRunId,stage:0})
                }
            })

          
        })

        await client.zapRunOutbox.deleteMany({
            where:{
                id: {
                    in:pendingRows.map(e=>e.id)
                }
            }
        })

        await new Promise(r=>setTimeout(r, 5000));
    }
}

main();
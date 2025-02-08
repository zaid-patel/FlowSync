import express, { json } from "express";
import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

const prismaClient =new PrismaClient()
const topic_name="zap-events";
const app=express()

const kafka=new Kafka({
    clientId:'outbox-processor-2',
    brokers: ['localhost:9092']
})


async function main() {


    // /kafka setup  ___
    const consumer=kafka.consumer({
        groupId:"2",
    })

    await consumer.connect();
    const producer=kafka.producer();
    await producer.connect();


    await consumer.subscribe({
        topic:topic_name,
        fromBeginning:true,
    })

    await consumer.run({
        autoCommit:false,  // by default dont commit as the worker might die before finishing the job
        eachMessage: async ({topic,partition,message})=>{

            console.log({
                topic,
                message,
                offset:message.offset,
            });


            if(!message.value?.toString()) return;


            const parsedValue=JSON.parse(message.value?.toString());
            const zapRunId=parsedValue.zapRunId;
            const stage=parsedValue.stage;

            const zapRundetails=await prismaClient.zapRun.findFirst({  // chain for gettting the type of action 
                where:{  //  as it needs to be perofrmed.
                    id:zapRunId,
                },
                include:{
                    zap:{
                        include:{
                            actions:{
                                include:{
                                    type:true,
                                }
                            }
                        }
                    }
                }
            });


            const currentAction=zapRundetails?.zap.actions.find((x:any) =>x.sortingOrder===stage)

            if(!currentAction){
                console.log("no acton found");
                return;
                
            }
            const zapRunMetadata = zapRundetails?.metadata;


            if(currentAction.type.id==="email"){
                // send email
                console.log("email");
                
            }
            if(currentAction.type.id==="solana"){
                // send sol
                console.log("sol");
                
            }


            await new Promise(r => setTimeout(r, 500));

            const lastStage = (zapRundetails?.zap.actions?.length || 1) - 1; // 1
            console.log(lastStage);
            console.log(stage);

            if(lastStage!==stage){
                console.log("not final stage");
                
                await producer.send({
                    topic:topic_name,
                    messages:[{
                        value:JSON.stringify({
                            stage:stage+1,
                            zapRunId,
                        })
                    }]
                })
            }

            await consumer.commitOffsets([{
                topic:topic_name,
                partition:partition,
                offset:(parseInt(message.offset)+1).toString()
            }])

            

        }, // for each message perform this fn




    })


    ///** */



} 

main();
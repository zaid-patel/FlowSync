import express, { json } from "express";
import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";
import { JsonObject } from "@prisma/client/runtime/library";
import { parse } from "./parser";
import dotenv from "dotenv"
import { log } from "console";
import { sendEmail } from "./email";
import { writeToNotion } from "./notion";

dotenv.config(); 

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
        // autoCommit:false,  // by default dont commit as the worker might die before finishing the job
        eachMessage: async ({topic,partition,message})=>{

            console.log({
                topic,
                message,
                offset:message.offset,
            });


            if(!message.value?.toString()) return;

                // log(message.value);
            const parsedValue=JSON.parse(message.value?.toString());
            const zapRunId=parsedValue.zapRunId;
            const stage=parsedValue.stage;
            console.log(parsedValue);
            
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

            log(zapRundetails)
            const currentAction=zapRundetails?.zap.actions.find((x) =>x.sortingOrder===stage)
            log(currentAction)

            if(!currentAction){
                console.log("no acton found");
                return;
                
            }
            const zapRunMetadata = zapRundetails?.metadata;
            log(zapRunMetadata)

            

            if(currentAction.type.id==="email"){
                // send email  
                const body = parse((currentAction.metadata as JsonObject )?.body as string, zapRunMetadata);
                const to = parse((currentAction.metadata as JsonObject)?.to  as string, zapRunMetadata);
                // const to=
                console.log(`Sending out email to ${to} body is ${body}`)
                await sendEmail(to, body);
                
            }
            if(currentAction.type.id==="solana"){
                // send sol
                console.log("sol");
                
            }
            // 6191c10c-b5f5-4fbf-8a75-f014648d83b1
            if(currentAction.type.id==="notion"){
                // edit notion
                console.log("notion");
                // @ts-ignore
                const pageId=currentAction.metadata.pageId.toString();
                // get accesstoken from auth table on basis of userId and pageId (pageId from actions table)
                const response=await prismaClient.auth.findFirst({
                    where:{
                        pageId,
                    }
                })
                if(response?.token){
                     //   text from parser
                const text=parse((currentAction.metadata as JsonObject )?.body as string,zapRunMetadata);
                // @ts-ignore
                await writeToNotion({notionId:pageId,accessToken:response.token,text,isDatabase:currentAction.metadata?.isDatabase});
                }
               
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
import { PrismaClient } from "@prisma/client";
import express, { json } from "express";


const client=new  PrismaClient()
const app=express()


app.use(express.json());

// app.get('/')

app.post("/hooks/catch/:userId/:zapId",async(req,res)=>{
    const userId=parseInt(req.params.userId);
    const zapId=req.params.zapId;

    const body=req.body;

    console.log(userId);

    const zap=await client.zap.findFirst({
        where:{
            id:zapId,
            userId:userId,
        }
    })

    if(!zap) {
        // console.log(11111);
        
        res.json({
            message:"invalid hook",
        })
        return; 
    }

    

    // console.log(zapId);
    
    await client.$transaction(async tx=>{
        const run=await tx.zapRun.create({
           data:{ 
            zapId:zapId,
            metadata:body as string,
        }

        });

        await tx.zapRunOutbox.create({
            data:{
                zapRunId:run.id,
            }
        })
    }
    )
    res.json({
        message:"webhook recived",
    })
})

app.listen(8000);

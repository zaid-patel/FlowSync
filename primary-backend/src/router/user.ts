


import { Router } from "express";
import {  SigninSchema, signupSchema } from "../types";
import { prismaClient } from "../db";
import { authMiddleware } from "../middleware";
import { JWT_PASSWORD } from "../config";
import jwt from "jsonwebtoken";



const router=Router();


// @ts-ignore
router.post("/signup", async (req,res) =>{
    const data=req.body;
    const parsedData=signupSchema.safeParse(data);

    console.log(data.name);
    
    if(!parsedData.success){
        console.log("unsafe");
        return res.status(411).json({
            message:"incorrect response"
        })   
    }

    console.log(parsedData.data.email);
    
    const existingUser=await prismaClient.user.findFirst({
        where: {
           
                email: parsedData.data.email,
             
            
        }
    })

    if(existingUser){
        return res.status(411).json("user already exists with the username")
    }

    await prismaClient.user.create({
        data:{
            email:parsedData.data.email,
            password:parsedData.data.password,
            name:parsedData.data.name,

        }
    })

    const user=await prismaClient.user.findFirst({
        where:{
            email:parsedData.data.email,
        }
    })

    // if(us)

    res.json({
        user,
    });


    return;


})



// @ts-ignore
router.post("/signin", async (req, res) => {
    const body = req.body;
    const parsedData = SigninSchema.safeParse(body);

    if (!parsedData.success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const user = await prismaClient.user.findFirst({
        where: {
            email: parsedData.data.email,
            password: parsedData.data.password
        }
    });
    
    if (!user) {
        return res.status(403).json({
            message: "Sorry credentials are incorrect"
        })
    }

    // sign the jwt
    const token = jwt.sign({
        id: user.id
    }, JWT_PASSWORD);

    res.json({
        token: token,
    });
    return;
})


// @ts-ignore
router.get("/", authMiddleware , async (req, res) => {
    
    // @ts-ignore
    const id = req.id;
    const user = await prismaClient.user.findFirst({
        where: {
            id
        },
        select: {
            name: true,
            email: true
        }
    });

    res.json({
        user
    });
    return;
})

export const userRouter = router;
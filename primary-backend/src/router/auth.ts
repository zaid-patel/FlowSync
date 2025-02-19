import axios from "axios";
import { Router } from "express";
import { prismaClient } from "../db";


const authRouter=Router();
console.log( process.env.NOTION_CLIENT_SECRET);


authRouter.post('/notion/:token',async (req,res)=>{
    const token=req.params.token ;
    const pageId=req.body.pageId;
    console.log(token);
    
    const base64 = Buffer.from(process.env.NOTION_CLIENT_ID+":"+process.env.NOTION_CLIENT_SECRET).toString("base64");
    // @ts-ignore
    const id: string = req.id;
    try {
        
        const response = await axios.post("https://api.notion.com/v1/oauth/token", {
            grant_type: "authorization_code",
            code: token,
            redirect_uri: process.env.NOTION_REDIRECT_URI,
        }, {
            headers: {
                "Authorization": `Basic ${base64}`,
                "Content-Type": "application/json",
                "Notion-Version": "2022-06-28"
            }
        });
    
        console.log(response.data);
        console.log(id);
        
        const authUser=await prismaClient.auth.create({
            data:{
                userId:parseInt(id),
               token:response.data.access_token,
               type:"notion",
               pageId,
        }
        })
        res.json({
            message:"token added to db"
        })
        
    } catch (error) {
        // @ts-ignore
        console.log(error.response ? error.response.data : error.message);

        return res.status(500).json({
            message:"retry"
        })
        
    }

})



export {authRouter}
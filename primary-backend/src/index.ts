import express from "express";
import { userRouter } from "./router/user.js";
import { zapRouter } from "./router/zap.js";
import cors from "cors";
import { triggerRouter } from "./router/trigger.js";
import { actionRouter } from "./router/action.js";
import { authRouter } from "./router/auth.js";
import { authMiddleware } from "./middleware.js";
import dotenv from "dotenv"
dotenv.config();
const app=express();
app.use(express.json())
app.use(cors());
app.get('/',(req,res)=>{
    res.status(200).json({
        message:"healthy"
    })
})
app.use("/api/v1/user",userRouter);
app.use("/api/v1/zap",zapRouter);
app.use("/api/v1/trigger",triggerRouter);
app.use("/api/v1/actions",actionRouter);
app.use("/api/v1/auth",authMiddleware, authRouter);

// console.log(pr);




app.listen(3000,()=>{
    console.log("server is running on port 3000");
    
});

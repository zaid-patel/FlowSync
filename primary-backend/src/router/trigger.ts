

import { Router } from "express";
import { prismaClient } from "../db";

const router = Router();

router.get("/available", async (req, res) => {
    // const a=req
    const availableTriggers = await prismaClient.availableTriggers.findMany({});
    res.json({
        availableTriggers
    })
});

export const triggerRouter = router;
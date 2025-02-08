import {z} from "zod";

export const signupSchema= z.object({
    email: z.string().email(),
    password: z.string(),
    name: z.string().min(5),

}) 


export const SigninSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export const ZapCreateSchema = z.object({
    availableTriggerId: z.string(),
    triggerMetadata: z.any().optional(),
    actions: z.array(z.object({
        availableActionId: z.string(),
        actionMetadata: z.any().optional(),
    }))
});

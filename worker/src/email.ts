import nodemailer from "nodemailer"
import dotenv from "dotenv"
import { log } from "console";
// SOL_PRIVATE_KEY=""
// SMTP_USERNAME=""
// SMTP_PASSWORD=""
// SMTP_ENDPOINT
// dotenv.config();
const transport = nodemailer.createTransport({
    host: process.env.SMTP_ENDPOINT,
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
    debug: true, // Enable debugging logs
    logger: true, 
  });

export async function sendEmail(to: string, body: string) {
    const msg=await transport.sendMail({
        from: process.env.SMTP_EMAIL,
        sender: process.env.SMTP_EMAIL,
        to,
        subject: "Hello from FLOWSYNC.",
        text: body,
    })
    log(msg.messageId)
}

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import nodemailer from "nodemailer";

export async function sendEmail(recipient: string, subject: string, body: string) {
  // Try sending email with AWS SES
  try {
    const sesClient = new SESClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
      }
    });
    const command = new SendEmailCommand({
      Destination: { ToAddresses: [recipient] },
      Message: {
        Body: { Text: { Data: body } },
        Subject: { Data: subject }
      },
      Source: process.env.SES_SOURCE_EMAIL
    });
    const response = await sesClient.send(command);
    return response;
  } catch (error) {
    console.error("SES send failed, falling back to Gmail", error);
    // Fallback using Gmail via nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: recipient,
      subject: subject,
      text: body
    };
    const info = await transporter.sendMail(mailOptions);
    return info;
  }
} 
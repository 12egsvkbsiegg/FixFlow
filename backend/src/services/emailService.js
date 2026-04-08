const nodemailer = require("nodemailer");

let transporter;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const hasSmtp =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (hasSmtp) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }

  return transporter;
};

const sendMail = async ({ to, subject, text }) => {
  const from = process.env.EMAIL_FROM || "no-reply@complaint-tracker.local";

  if (!to) {
    return;
  }

  const info = await getTransporter().sendMail({ from, to, subject, text });

  if (info.message) {
    console.log("Email payload (jsonTransport):", info.message.toString());
  }
};

const sendComplaintMail = async ({ to, subject, text }) => {
  await sendMail({ to, subject, text });
};

const sendOtpMail = async ({ to, otpCode, expiryMinutes }) => {
  await sendMail({
    to,
    subject: "Verify your email (OTP)",
    text: `Your OTP is ${otpCode}. It expires in ${expiryMinutes} minutes.`
  });
};

module.exports = { sendComplaintMail, sendOtpMail };

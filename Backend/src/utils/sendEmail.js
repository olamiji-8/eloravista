// src/utils/sendEmail.js
import nodemailer from 'nodemailer';

const sendEmail = async ({ email, subject, html, text = '' }) => {
  // Check for required SMTP config using the correct env variable names
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('sendEmail: SMTP not configured, skipping email send', { to: email, subject });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Fixed: was EMAIL_PASS, your .env uses EMAIL_PASSWORD
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;   
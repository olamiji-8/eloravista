// src/config/email.js
import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Email templates
const emailTemplates = {
  // Welcome email template
  welcome: (name, verificationUrl) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to EloraVista!</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Thank you for joining EloraVista! We're excited to have you as part of our community.</p>
          <p>Please verify your email address by clicking the button below:</p>
          <center>
            <a href="${verificationUrl}" class="button">Verify Email</a>
          </center>
          <p>This link expires in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
          <p>Best regards,<br>The EloraVista Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} EloraVista. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Order confirmation template
  orderConfirmation: (name, orderId, orderItems, totalPrice) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-item { padding: 10px; border-bottom: 1px solid #ddd; }
        .total { font-size: 18px; font-weight: bold; color: #2563eb; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Thank you for your order! Your order #${orderId} has been confirmed and is being processed.</p>
          <h3>Order Details:</h3>
          ${orderItems.map(item => `
            <div class="order-item">
              <strong>${item.name}</strong> x ${item.quantity} - £${item.price}
            </div>
          `).join('')}
          <p class="total">Total: £${totalPrice}</p>
          <p>We'll send you a shipping notification when your order is on its way.</p>
          <p>Thank you for shopping with us!</p>
          <p>Best regards,<br>The EloraVista Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} EloraVista. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Contact form template (to admin)
  contactAdmin: (name, email, subject, message) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; }
        .content { background: #f9f9f9; padding: 30px; }
        .info-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #2563eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Contact Form Submission</h2>
        </div>
        <div class="content">
          <div class="info-box">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          <div class="info-box">
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  // Contact form confirmation (to user)
  contactUser: (name, message) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .message-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #2563eb; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Contacting Us!</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>We've received your message and will get back to you as soon as possible.</p>
          <div class="message-box">
            <p><strong>Your message:</strong></p>
            <p>${message}</p>
          </div>
          <p>Our team typically responds within 24-48 hours.</p>
          <p>Best regards,<br>The EloraVista Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} EloraVista. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
};

module.exports = { createTransporter, emailTemplates };
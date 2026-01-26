import Contact from '../models/Contact.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

// Submit contact form
export const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
    });
    
    // Send email to admin
    const adminHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;
    
    await sendEmail({
      email: process.env.ADMIN_EMAIL,
      subject: `New Contact: ${subject}`,
      html: adminHtml,
    });
    
    // Send confirmation to user
    const userHtml = `
      <h2>Thank You for Contacting EloraVista!</h2>
      <p>Hi ${name},</p>
      <p>We've received your message and will get back to you shortly.</p>
      <p><strong>Your message:</strong></p>
      <p>${message}</p>
      <br>
      <p>Best regards,<br>EloraVista Team</p>
    `;
    
    await sendEmail({
      email: email,
      subject: 'We received your message - EloraVista',
      html: userHtml,
    });
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: contact,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all contacts (Admin)
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort('-createdAt');
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
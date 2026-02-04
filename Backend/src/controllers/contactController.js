// src/controllers/contactController.js
import Contact from '../models/Contact.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
export const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    console.log('=== Contact Form Submission ===');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Subject:', subject);
    console.log('Message length:', message?.length);
    
    // Create contact entry
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
    });
    
    console.log('Contact saved:', contact._id);

    // ===== SEND EMAIL TO ADMIN =====
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      
      if (adminEmail) {
        const adminHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #233e89; border-bottom: 3px solid #233e89; padding-bottom: 10px;">
              📧 New Contact Form Submission
            </h2>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>From:</strong> ${name}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p style="margin: 10px 0;"><strong>Subject:</strong> ${subject}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-left: 4px solid #233e89; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Message:</strong></p>
              <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              <em>Reply directly to this email to respond to the customer.</em>
            </p>
          </div>
        `;
        
        await sendEmail({
          email: adminEmail,
          subject: `📧 New Contact: ${subject}`,
          html: adminHtml,
        });
        
        console.log('Admin notification sent to:', adminEmail);
      } else {
        console.warn('ADMIN_EMAIL not configured');
      }
    } catch (adminEmailError) {
      console.error('Admin email error:', adminEmailError);
      // Don't fail the submission if admin email fails
    }

    // ===== SEND CONFIRMATION TO USER =====
    try {
      const userHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #233e89; border-bottom: 3px solid #233e89; padding-bottom: 10px;">
            Thank You for Contacting EloraVista!
          </h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Hi <strong>${name}</strong>,
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            We've received your message and will get back to you as soon as possible, usually within 24-48 hours.
          </p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #666;"><strong>Your message:</strong></p>
            <p style="margin: 0; white-space: pre-wrap; line-height: 1.6; color: #333;">${message}</p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            If you have any urgent concerns, feel free to call us at <strong>(+44) 07721562843</strong>.
          </p>
          
          <br>
          <p style="font-size: 16px; color: #333;">
            Best regards,<br>
            <strong style="color: #233e89;">EloraVista Team</strong>
          </p>
        </div>
      `;
      
      await sendEmail({
        email: email,
        subject: 'We received your message - EloraVista',
        html: userHtml,
      });
      
      console.log('Confirmation email sent to:', email);
    } catch (userEmailError) {
      console.error('User confirmation email error:', userEmailError);
      // Don't fail the submission if confirmation email fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: {
        _id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    console.error('=== Contact Form Error ===');
    console.error(error);
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message. Please try again or contact us directly.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all contacts
// @route   GET /api/contact
// @access  Private/Admin
export const getContacts = async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = status ? { status } : {};
    
    const contacts = await Contact.find(query).sort('-createdAt');
    
    res.status(200).json({ 
      success: true, 
      count: contacts.length,
      data: contacts 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single contact
// @route   GET /api/contact/:id
// @access  Private/Admin
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
    }
    
    // Mark as read if it was new
    if (contact.status === 'new') {
      contact.status = 'read';
      await contact.save();
    }
    
    res.status(200).json({ 
      success: true, 
      data: contact 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update contact status
// @route   PUT /api/contact/:id/status
// @access  Private/Admin
export const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
    }
    
    contact.status = status;
    await contact.save();
    
    res.status(200).json({ 
      success: true, 
      data: contact 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reply to contact
// @route   POST /api/contact/:id/reply
// @access  Private/Admin
export const replyToContact = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
    }
    
    // Send reply email
    const replyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #233e89;">Reply from EloraVista</h2>
        <p>Hi ${contact.name},</p>
        <p>Thank you for contacting us. Here's our response to your inquiry:</p>
        <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #233e89; margin: 20px 0;">
          <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${replyMessage}</p>
        </div>
        <p><strong>Your original message:</strong></p>
        <p style="color: #666; font-style: italic;">${contact.message}</p>
        <br>
        <p>Best regards,<br>EloraVista Team</p>
      </div>
    `;
    
    await sendEmail({
      email: contact.email,
      subject: `Re: ${contact.subject}`,
      html: replyHtml,
    });
    
    // Update contact
    contact.replied = true;
    contact.replyMessage = replyMessage;
    contact.repliedAt = Date.now();
    contact.status = 'replied';
    await contact.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Reply sent successfully',
      data: contact 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete contact
// @route   DELETE /api/contact/:id
// @access  Private/Admin
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
    }
    
    await contact.deleteOne();
    
    res.status(200).json({ 
      success: true, 
      message: 'Contact message deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
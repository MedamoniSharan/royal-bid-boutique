import nodemailer from 'nodemailer';
import { AppError } from '../middleware/errorHandler.js';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  welcome: {
    subject: 'Welcome to Royal Bid Boutique!',
    template: (name) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Royal Bid Boutique!</h2>
        <p>Dear ${name},</p>
        <p>Thank you for joining Royal Bid Boutique! We're excited to have you as part of our community.</p>
        <p>Your account has been successfully created. You can now:</p>
        <ul>
          <li>Browse and bid on exclusive auctions</li>
          <li>Create your own auctions</li>
          <li>Track your bidding history</li>
          <li>Manage your profile and preferences</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The Royal Bid Boutique Team</p>
      </div>
    `
  },
  
  emailVerification: {
    subject: 'Verify Your Email Address',
    template: (name, verificationUrl) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verify Your Email Address</h2>
        <p>Dear ${name},</p>
        <p>Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>The Royal Bid Boutique Team</p>
      </div>
    `
  },
  
  passwordReset: {
    subject: 'Reset Your Password',
    template: (name, resetUrl) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>Dear ${name},</p>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>Best regards,<br>The Royal Bid Boutique Team</p>
      </div>
    `
  },
  
  bidNotification: {
    subject: 'New Bid on Your Auction',
    template: (auctionTitle, bidAmount, bidderName) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Bid on Your Auction</h2>
        <p>Great news! Someone has placed a bid on your auction.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Auction: ${auctionTitle}</h3>
          <p><strong>Bid Amount:</strong> $${bidAmount}</p>
          <p><strong>Bidder:</strong> ${bidderName}</p>
        </div>
        <p>Keep an eye on your auction to see if there are more bids!</p>
        <p>Best regards,<br>The Royal Bid Boutique Team</p>
      </div>
    `
  },
  
  auctionEnding: {
    subject: 'Auction Ending Soon',
    template: (auctionTitle, timeRemaining) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Auction Ending Soon</h2>
        <p>Don't miss out! An auction you're watching is ending soon.</p>
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="margin-top: 0;">Auction: ${auctionTitle}</h3>
          <p><strong>Time Remaining:</strong> ${timeRemaining}</p>
        </div>
        <p>Place your bid now before it's too late!</p>
        <p>Best regards,<br>The Royal Bid Boutique Team</p>
      </div>
    `
  },
  
  auctionWon: {
    subject: 'Congratulations! You Won the Auction',
    template: (auctionTitle, winningBid) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Congratulations! You Won!</h2>
        <p>Great news! You've won the auction.</p>
        <div style="background-color: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="margin-top: 0;">Auction: ${auctionTitle}</h3>
          <p><strong>Winning Bid:</strong> $${winningBid}</p>
        </div>
        <p>Please complete your payment within 24 hours to secure your item.</p>
        <p>Best regards,<br>The Royal Bid Boutique Team</p>
      </div>
    `
  },
  
  paymentConfirmation: {
    subject: 'Payment Confirmation',
    template: (auctionTitle, amount, transactionId) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Payment Confirmed</h2>
        <p>Thank you for your payment!</p>
        <div style="background-color: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="margin-top: 0;">Auction: ${auctionTitle}</h3>
          <p><strong>Amount Paid:</strong> $${amount}</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
        </div>
        <p>The seller will contact you shortly to arrange shipping.</p>
        <p>Best regards,<br>The Royal Bid Boutique Team</p>
      </div>
    `
  }
};

// Send email function
export const sendEmail = async (to, templateName, data = {}) => {
  try {
    const transporter = createTransporter();
    const template = emailTemplates[templateName];
    
    if (!template) {
      throw new AppError(`Email template '${templateName}' not found`, 400);
    }
    
    let subject = template.subject;
    let html = template.template(data);
    
    // Replace placeholders in subject if any remain
    Object.keys(data).forEach(key => {
      const placeholder = new RegExp(`\\{${key}\\}`, 'g');
      subject = subject.replace(placeholder, data[key]);
    });
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new AppError('Failed to send email', 500);
  }
};

// Send bulk email
export const sendBulkEmail = async (recipients, templateName, data = {}) => {
  try {
    const transporter = createTransporter();
    const template = emailTemplates[templateName];
    
    if (!template) {
      throw new AppError(`Email template '${templateName}' not found`, 400);
    }
    
    let subject = template.subject;
    let html = template.template(data);
    
    // Replace placeholders in subject if any remain
    Object.keys(data).forEach(key => {
      const placeholder = new RegExp(`\\{${key}\\}`, 'g');
      subject = subject.replace(placeholder, data[key]);
    });
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      bcc: recipients.join(','),
      subject,
      html
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Bulk email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending bulk email:', error);
    throw new AppError('Failed to send bulk email', 500);
  }
};

// Send custom email
export const sendCustomEmail = async (to, subject, html, text = '') => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Custom email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending custom email:', error);
    throw new AppError('Failed to send custom email', 500);
  }
};

// Verify email configuration
export const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('Email configuration verification failed:', error);
    return false;
  }
};

// Email queue system (for future implementation)
export const addToEmailQueue = async (emailData) => {
  // This would integrate with a queue system like Bull or Agenda
  // For now, we'll just log it
  console.log('Email added to queue:', emailData);
};

export default {
  sendEmail,
  sendBulkEmail,
  sendCustomEmail,
  verifyEmailConfig,
  addToEmailQueue,
  emailTemplates
};

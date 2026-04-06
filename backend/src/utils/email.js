/**
 * Email Utility
 * Send emails using Nodemailer
 * Uses Ethereal in development for testing
 */
const nodemailer = require('nodemailer');
const env = require('../configs/env');
const logger = require('./logger');

let transporter = null;

/**
 * Initialize email transporter
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  if (env.isDev && (!env.SMTP_USER || !env.SMTP_PASS)) {
    // Create Ethereal test account for development
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      logger.info(`Ethereal email account created: ${testAccount.user}`);
    } catch {
      logger.warn('Failed to create Ethereal account, emails disabled');
      return null;
    }
  } else {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  return transporter;
};

/**
 * Send email
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transport = await getTransporter();
    if (!transport) {
      logger.warn('Email transporter not available, skipping email');
      return null;
    }

    const info = await transport.sendMail({
      from: `"FastFood Pro" <${env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text,
    });

    // Log Ethereal preview URL in development
    if (env.isDev) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        logger.info(`Email preview: ${previewUrl}`);
      }
    }

    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Failed to send email:', error.message);
    return null;
  }
};

/**
 * Email templates
 */
const emailTemplates = {
  orderConfirmation(order, user) {
    const itemsHtml = order.items
      .map(item => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${item.price.toFixed(2)}</td></tr>`)
      .join('');

    return {
      subject: `Order Confirmation #${order._id.toString().slice(-8).toUpperCase()}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#eee;border-radius:12px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#ff6b35,#f7931e);padding:30px;text-align:center">
            <h1 style="margin:0;color:#fff;font-size:24px">🍔 FastFood Pro</h1>
            <p style="margin:10px 0 0;color:rgba(255,255,255,0.9)">Order Confirmed!</p>
          </div>
          <div style="padding:30px">
            <p>Hi ${user.name || 'there'},</p>
            <p>Your order has been received and is being prepared.</p>
            <h3 style="color:#ff6b35">Order #${order._id.toString().slice(-8).toUpperCase()}</h3>
            <table style="width:100%;border-collapse:collapse;margin:20px 0">
              <thead><tr style="border-bottom:2px solid #ff6b35"><th style="padding:8px;text-align:left">Item</th><th style="padding:8px;text-align:center">Qty</th><th style="padding:8px;text-align:right">Price</th></tr></thead>
              <tbody>${itemsHtml}</tbody>
              <tfoot><tr><td colspan="2" style="padding:12px 8px;font-weight:bold;color:#ff6b35">Total</td><td style="padding:12px 8px;text-align:right;font-weight:bold;color:#ff6b35;font-size:18px">$${order.totalPrice.toFixed(2)}</td></tr></tfoot>
            </table>
            <p style="color:#888;font-size:12px;margin-top:30px">Thank you for choosing FastFood Pro! 🎉</p>
          </div>
        </div>
      `,
    };
  },

  orderStatusUpdate(order, user, status) {
    const statusMessages = {
      confirmed: '✅ Your order has been confirmed and is being prepared.',
      preparing: '👨‍🍳 Your order is being prepared by our chefs.',
      ready: '🎉 Your order is ready for pickup!',
      delivered: '🚀 Your order has been delivered. Enjoy!',
      cancelled: '❌ Your order has been cancelled.',
    };

    return {
      subject: `Order Update #${order._id.toString().slice(-8).toUpperCase()}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#eee;border-radius:12px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#ff6b35,#f7931e);padding:30px;text-align:center">
            <h1 style="margin:0;color:#fff;font-size:24px">🍔 FastFood Pro</h1>
          </div>
          <div style="padding:30px">
            <p>Hi ${user.name || 'there'},</p>
            <h3>Order #${order._id.toString().slice(-8).toUpperCase()}</h3>
            <p style="font-size:18px">${statusMessages[status] || `Status updated to: ${status}`}</p>
            <p style="color:#888;font-size:12px;margin-top:30px">FastFood Pro Team</p>
          </div>
        </div>
      `,
    };
  },
};

module.exports = { sendEmail, emailTemplates };

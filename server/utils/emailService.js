const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const useGmail = !!(process.env.EMAIL && process.env.EMAIL_PASSWORD);
  try {
    let transporter;

    if (useGmail) {
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const info = await transporter.sendMail({
        from: `"Nestfinder" <${process.env.EMAIL}>`,
        to,
        subject,
        html,
      });

      console.log(`[EMAIL] Sent successfully via Gmail SMTP to ${to}, MessageID: ${info.messageId}`);
      return true;
    } else {
      // Fallback for development/simulation
      console.log(`\n==================================================`);
      console.log(`[EMAIL SIMULATOR]`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body (Plain Text):`);
      console.log(html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
      console.log(`==================================================\n`);
      return true;
    }
  } catch (error) {
    console.error('Email sending failed:', error.message);
    // If SMTP fails, fall back to console logging to ensure developer flow is never blocked
    console.log(`\n==================================================`);
    console.log(`[EMAIL SIMULATOR - FALLBACK]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body (Plain Text):`);
    console.log(html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
    console.log(`==================================================\n`);
    return true;
  }
};

const sendBookingConfirmation = async (userEmail, userName, booking) => {
  const checkIn = new Date(booking.checkIn).toLocaleDateString();
  const checkOut = new Date(booking.checkOut).toLocaleDateString();
  const title = booking.propertyId?.title || 'Your stay';
  const location = booking.propertyId?.location || '';
  const price = booking.totalPrice.toLocaleString('en-IN');

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #ff385c; border-bottom: 2px solid #ff385c; padding-bottom: 10px;">Booking Confirmed!</h2>
      <p>Hi ${userName},</p>
      <p>Your reservation for <strong>${title}</strong> has been successfully confirmed and paid.</p>
      <div style="background-color: #f7f7f7; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #484848;">Reservation Details</h3>
        <table style="width: 100%; font-size: 14px;">
          <tr><td><strong>Location:</strong></td><td>${location}</td></tr>
          <tr><td><strong>Check-In:</strong></td><td>${checkIn}</td></tr>
          <tr><td><strong>Check-Out:</strong></td><td>${checkOut}</td></tr>
          <tr><td><strong>Guests:</strong></td><td>${booking.guests}</td></tr>
          <tr><td><strong>Total Price:</strong></td><td>₹${price}</td></tr>
        </table>
      </div>
      <p>We hope you have a fantastic trip! If you have any questions, you can contact your host directly from the app.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #767676; text-align: center;">Airbnb Clone. All rights reserved.</p>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Reservation Confirmed - ${title}`,
    html,
  });
};

const sendOTPEmail = async (userEmail, userName, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #ff385c; margin: 0; font-size: 24px; font-weight: bold; tracking-tight">Nestfinder</h2>
      </div>
      <hr style="border: 0; border-top: 1px solid #eaeaea; margin-bottom: 24px;" />
      <p style="font-size: 16px; color: #222222; line-height: 1.5; margin: 0 0 16px 0;">Hello,</p>
      <p style="font-size: 16px; color: #484848; line-height: 1.5; margin: 0 0 24px 0;">We received a request to reset your password.</p>
      <div style="text-align: center; margin: 24px 0; padding: 16px; background-color: #f7f7f7; border-radius: 8px; border: 1px solid #ebebeb;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #ff385c; display: inline-block;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #717171; line-height: 1.5; margin: 0 0 24px 0; font-weight: 500;">This OTP is valid for 5 minutes.</p>
      <p style="font-size: 14px; color: #717171; line-height: 1.5; margin: 0 0 24px 0;">If you did not request this, you can safely ignore this email.</p>
      <p style="font-size: 16px; color: #222222; line-height: 1.5; margin: 0;">Thank you.</p>
      <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 24px 0;" />
      <p style="font-size: 12px; color: #a3a3a3; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} Nestfinder. All rights reserved.</p>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Reset Your Password',
    html,
  });
};

const sendSignupOTPEmail = async (userEmail, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #ff385c; margin: 0; font-size: 24px; font-weight: bold; tracking-tight">Nestfinder</h2>
      </div>
      <hr style="border: 0; border-top: 1px solid #eaeaea; margin-bottom: 24px;" />
      <p style="font-size: 16px; color: #222222; line-height: 1.5; margin: 0 0 16px 0;">Hello,</p>
      <p style="font-size: 16px; color: #484848; line-height: 1.5; margin: 0 0 8px 0;">Welcome!</p>
      <p style="font-size: 16px; color: #484848; line-height: 1.5; margin: 0 0 24px 0;">Your verification code is:</p>
      <div style="text-align: center; margin: 24px 0; padding: 16px; background-color: #f7f7f7; border-radius: 8px; border: 1px solid #ebebeb;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #ff385c; display: inline-block;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #717171; line-height: 1.5; margin: 0 0 24px 0; font-weight: 500;">This OTP is valid for 5 minutes.</p>
      <p style="font-size: 14px; color: #717171; line-height: 1.5; margin: 0 0 24px 0;">If you didn't create this account, simply ignore this email.</p>
      <p style="font-size: 16px; color: #222222; line-height: 1.5; margin: 0;">Thank you.</p>
      <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 24px 0;" />
      <p style="font-size: 12px; color: #a3a3a3; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} Nestfinder. All rights reserved.</p>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Verify Your Airbnb Clone Account',
    html,
  });
};

module.exports = { sendBookingConfirmation, sendOTPEmail, sendSignupOTPEmail };

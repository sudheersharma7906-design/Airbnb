const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  try {
    const useRealEmail = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS;
    let transporter;

    if (useRealEmail) {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      let testAccount = await nodemailer.createTestAccount().catch(() => null);
      if (testAccount) {
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      }
    }

    if (!transporter) {
      console.log(`[EMAIL SIMULATOR] To: ${to}\nSubject: ${subject}\nBody: ${html.replace(/<[^>]*>/g, '')}`);
      return true;
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Airbnb Clone" <noreply@airbnb-clone.com>',
      to,
      subject,
      html,
    });

    if (!useRealEmail) {
      console.log(`[EMAIL SIMULATOR] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } else {
      console.log(`[EMAIL] Sent successfully to ${to}, MessageID: ${info.messageId}`);
    }

    return true;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    return false;
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

module.exports = { sendBookingConfirmation };

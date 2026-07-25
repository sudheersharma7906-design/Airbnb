const twilio = require('twilio');

const sendSMS = async (to, body) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromPhone) {
      console.error('[SMS] Twilio credentials are not configured. Cannot send SMS.');
      return false;
    }

    const client = twilio(accountSid, authToken);
    const message = await client.messages.create({
      body,
      from: fromPhone,
      to,
    });

    console.log(`[SMS] Sent successfully to ${to}, SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error('[SMS] Sending failed:', error.message);
    return false;
  }
};

const sendSignupOTPSMS = async (mobile, otp) => {
  const body = `Your Nestfinder verification code is ${otp}. It expires in 5 minutes. Do not share this code with anyone.`;
  return sendSMS(mobile, body);
};

module.exports = { sendSMS, sendSignupOTPSMS };

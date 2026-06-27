const twilio = require('twilio');

const sendSMS = async (to, body) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromPhone) {
      console.log(`\n==================================================`);
      console.log(`[SMS SIMULATOR]`);
      console.log(`To: ${to}`);
      console.log(`Body: ${body}`);
      console.log(`==================================================\n`);
      return true;
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
    console.error('SMS sending failed:', error.message);
    // Return true in development fallback so we don't block the flow if Twilio fails
    return true;
  }
};

const sendSignupOTPSMS = async (mobile, otp) => {
  const body = `Your verification code is ${otp}. It expires in 5 minutes.`;
  return sendSMS(mobile, body);
};

module.exports = { sendSMS, sendSignupOTPSMS };

/**
 * SMS Service Module
 * Handles SMS OTP dispatches and console simulation.
 */

const sendSMS = async (to, body) => {
  console.log(`\n==================================================`);
  console.log(`[SMS SIMULATOR - DEV CONSOLE]`);
  console.log(`To: ${to}`);
  console.log(`Body: ${body}`);
  console.log(`==================================================\n`);
  return true;
};

const sendSignupOTPSMS = async (mobile, otp) => {
  const body = `Your Nestfinder verification code is ${otp}. It expires in 5 minutes. Do not share this code with anyone.`;
  return sendSMS(mobile, body);
};

module.exports = { sendSMS, sendSignupOTPSMS };

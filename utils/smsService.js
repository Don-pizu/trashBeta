// utils/smsService.js


const axios = require('axios');

exports.notificationSMS = async ({ to, body }) => {
  try {
    const response = await axios.post(
      'https://api.termii.com/api/sms/send',
      {
        to,
        from: process.env.TERMII_SENDER_ID,
        sms: ` TrashBeta Notification: ${body}`,
        type: 'plain',
        channel: 'generic',
        api_key: process.env.TERMII_API_KEY
      }
    );

    return response.data;

  } catch (error) {
    console.error('Termii SMS Error:', error.response?.data || error.message);
    throw new Error('SMS sending failed');
  }
};




/*
const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send SMS OTP
exports.notificationSMS = async ({ to, body }) => {
  try {
    const message = await client.messages.create({
      body: ` TrashBeta Notification: ${body}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to, // must be in E.164 format e.g. +2348012345678
    });
    console.log("✅ SMS OTP sent:", message.sid);
    return true;
  } catch (error) {
    console.error("❌ SMS Error:", error.message);
    return false;
  }
};
*/
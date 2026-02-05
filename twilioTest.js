require('dotenv').config();
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

client.api.accounts(process.env.TWILIO_ACCOUNT_SID)
  .fetch()
  .then(acc => console.log('AUTH WORKS:', acc.friendlyName))
  .catch(err => console.error('AUTH FAILED:', err.message));

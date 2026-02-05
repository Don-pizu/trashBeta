// util/phoneFormatter.js

function formatPhone(phone) {
  if (!phone) 
    return null;

  let cleaned = phone.toString().trim();

  // If it already starts with +, assume it's valid format
  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  // If it starts with 0 (Nigerian local format, e.g. 080...)
  if (cleaned.startsWith("0")) {
    return "+234" + cleaned.slice(1);
  }

  // If it starts with 234 but no +
  if (cleaned.startsWith("234")) {
    return "+" + cleaned;
  }

  // Nigerian number length validation
  if (!/^\+234[7-9][0-1]\d{8}$/.test(cleaned)) {
    throw new Error('Invalid Nigerian phone number');
  }

  // Otherwise return as is (user gave something like +44...)
  return cleaned;
}

module.exports = { formatPhone };

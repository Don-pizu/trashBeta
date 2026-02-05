//utils/generateTrackingId.js

exports.generateTrackingId = () => {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `TB-${random}`;
};

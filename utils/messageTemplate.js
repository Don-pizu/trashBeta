//utils/messageTemplate.js

exports.reportCreated = (trackingId) => ({
  email: {
    subject: `<p>Your report <b>${trackingId}</b> has been received.</p>`,
    html: `<p>Your report <b>${trackingId}</b> has been received.</p>`
  },
  sms: `Your Trash Beta report (${trackingId}) has been received.`
});

exports.reportAssigned = (trackingId) => ({
  email: {
    subject: `<p>You have been assigned report <b>${trackingId}</b>.</p>`,
    html: `<p>You have been assigned report <b>${trackingId}</b>.</p>`
  },
  sms: `New Trash Beta task assigned: ${trackingId}`
});

exports.reportCompleted = (trackingId) => ({
  email: {
    subject: `<p>Your report <b>${trackingId}</b> has been completed.</p>`,
    html: `<p>Your report <b>${trackingId}</b> has been completed.</p>`
  },
  sms: `Your Trash Beta report (${trackingId}) has been completed.`
});

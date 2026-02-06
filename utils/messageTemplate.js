//utils/messageTemplate.js

exports.reportCreated = (trackingId) => ({
  email: {
    subject: 'Trash Report Submitted',
    html: `<p>Your report <b>${trackingId}</b> has been received.</p>`
  },
  sms: `Your Trash Beta report (${trackingId}) has been received.`
});

exports.reportAssigned = (trackingId) => ({
  email: {
    subject: 'New Task Assigne',
    html: `<p>You have been assigned report <b>${trackingId}</b>.</p>`
  },
  sms: `New Trash Beta task assigned: ${trackingId}`
});

exports.reportCompleted = (trackingId) => ({
  email: {
    subject: 'Trash Report Completed',
    html: `<p>Your report <b>${trackingId}</b> has been completed.</p>`
  },
  sms: `Your Trash Beta report (${trackingId}) has been completed.`
});

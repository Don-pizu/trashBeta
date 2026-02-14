//service/notificationService.js


const { notificationEmail } = require('../utils/emailService');
const { notificationSMS } = require('../utils/smsService');

exports.notify = async ({ user, template, preference }) => {

  if (!user) return;

  // PRIORITY ORDER:
  // 1️⃣ Report-level preference
  // 2️⃣ User profile default
  // 3️⃣ Fallback to EMAIL

  const channel = preference || user.profile?.notificationChannel || 'EMAIL';

  try {

    // ===== EMAIL ONLY =====
    if (channel === 'EMAIL') {
      if (user.email) {
        await notificationEmail({
          to: user.email,
          subject: template.email.subject,
          html: template.email.html
        });
      }
      return;
    }

    // ===== SMS ONLY =====
    if (channel === 'SMS') {
      if (user.profile?.phone) {
        await notificationSMS({
          to: user.profile.phone,
          body: template.sms
        });
      }
      return;
    }

    // ===== BOTH =====
    if (channel === 'BOTH') {

      if (user.email) {
        await notificationEmail({
          to: user.email,
          subject: template.email.subject,
          html: template.email.html
        });
      }

      if (user.profile?.phone) {
        await notificationSMS({
          to: user.profile.phone,
          body: template.sms
        });
      }

      return;
    }

  } catch (err) {
    console.error('Notification failed:', err.message);
  }
};

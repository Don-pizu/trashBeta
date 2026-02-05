//service/notificationService.js


const { notificationEmail } = require('../utils/emailService');
const { notificationSMS } = require('../utils/smsService');

exports.notify = async ({ user, template }) => {
   if (!user) return;

   try {
      if (user.email) {
         await notificationEmail({
            to: user.email,
            subject: template.email.subject,
            html: template.email.html
         });
      }
   } catch (err) {
      console.error('Email failed', err.message);
   }

   try {
      if (user.phone) {
         await notificationSMS({
            to: user.phone,
            body: template.sms
         });
      }
   } catch (err) {
      console.error('SMS failed', err.message);
   }
};

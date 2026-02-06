//service/notificationService.js


const { notificationEmail } = require('../utils/emailService');
const { notificationSMS } = require('../utils/smsService');

exports.notify = async ({ user, template }) => {

   	if (!user) return;

   	const channel = user.profile?.notificationChannel;

   	try {

      	// SMS Preferred
      	if (channel === 'SMS' && user.profile?.phone) {
         	await notificationSMS({
            	to: user.profile.phone,
            	body: template.sms
         	});
         	return;
      	}

      	// EMAIL Preferred
      	if (channel === 'EMAIL' && user.email) {
         	await notificationEmail({
            	to: user.email,
            	subject: template.email.subject,
            	html: template.email.html
         	});
         	return;
      	}

      	// FALLBACK → if preference missing
      	if (user.email) {
         	await notificationEmail({
            	to: user.email,
            	subject: template.email.subject,
            	html: template.email.html
         	});
      	}

   	} catch (err) {
    	console.error('Notification failed', err.message);
   	}
};

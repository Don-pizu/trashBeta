//util/emailService.js


const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendOtpEmail = async (to, otp) => {
  try {
    const htmlContent = `
      <div style="font-family: 'Segoe UI', sans-serif; background-color: #f5f7fa; padding: 30px;">
        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background: #009900; color: white; text-align: center; padding: 25px 10px;">
            <h1 style="margin: 0; font-size: 24px;">Trash Beta</h1>
            <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">Secure Verification Code</p>
          </div>

          <div style="padding: 30px; color: #333;">
            <p style="font-size: 16px;">Hi there 👋,</p>
            <p style="font-size: 15px; line-height: 1.6;">
              Use the verification code below to complete your registration on <strong>Tash Beta</strong>.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: #009900; color: white; padding: 14px 30px; border-radius: 8px; font-size: 22px; letter-spacing: 4px; font-weight: bold;">
                ${otp}
              </div>
            </div>

            <p style="font-size: 14px; color: #666; text-align: center;">
              This code expires in <strong>10 minutes</strong>.  
              If you didn’t request this code, please ignore this email.
            </p>
          </div>

          <div style="background: #f0f4f8; text-align: center; padding: 15px; font-size: 12px; color: #888;">
            © ${new Date().getFullYear()} Trash Beta. All rights reserved.<br/>
            <a href="https://trashbeta.onrender.com" style="color: #009900; text-decoration: none;">Visit Website</a>
          </div>
        </div>
      </div>
    `;

    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL, // no-reply@medcheck.store
      to,
      subject: "Your TrashBeta OTP Code",
      html: htmlContent
    });

    //console.log(`✅ OTP email sent to ${to}: ${otp}`);
    //console.log("Resend response:", data);
    return data;
  } catch (err) {
    console.error("❌ Error sending OTP email:", err);
    throw err;
  }
};




exports.forgotPassOtpEmail = async (to, otp) => {
  try {
    const htmlContent = `
      <div style="font-family: 'Segoe UI', sans-serif; background-color: #f5f7fa; padding: 30px;">
        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background: #009900; color: white; text-align: center; padding: 25px 10px;">
            <h1 style="margin: 0; font-size: 24px;">Trash Beta</h1>
            <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">Password Reset Link</p>
          </div>

          <div style="padding: 30px; color: #333;">
            <p style="font-size: 16px;">Hi there 👋,</p>
            <p style="font-size: 15px; line-height: 1.6;">
              Use the link below to reset your password on <strong>Trash Beta</strong>.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: #009900; color: white; padding: 14px 30px; border-radius: 8px; font-size: 22px; letter-spacing: 4px; font-weight: bold;">
                ${otp}
              </div>
            </div>

            <p style="font-size: 14px; color: #666; text-align: center;">
              This Link expires in <strong>15 minutes</strong>.  
              If you didn’t request this Reset Password Link, please ignore this email.
            </p>
          </div>

          <div style="background: #f0f4f8; text-align: center; padding: 15px; font-size: 12px; color: #888;">
            © ${new Date().getFullYear()} Trash Beta. All rights reserved.<br/>
            <a href="https://trashbeta.onrender.com" style="color: #009900; text-decoration: none;">Visit Website</a>
          </div>
        </div>
      </div>
    `;

    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL, // no-reply@medcheck.store
      to,
      subject: "TrashBeta Reset Password Link",
      html: htmlContent
    });

    console.log(`✅ OTP email sent to ${to}: ${otp}`);
    //console.log("Resend response:", data);
    return data;
  } catch (err) {
    console.error("❌ Error sending OTP email:", err);
    throw err;
  }
};



exports.notificationEmail = async ({ to, subject, html }) => {
  try {
    const htmlContent = `
      <div style="font-family: 'Segoe UI', sans-serif; background-color: #f5f7fa; padding: 30px;">
        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background: #009900; color: white; text-align: center; padding: 25px 10px;">
            <h1 style="margin: 0; font-size: 24px;">Trash Beta</h1>
            <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">Notification</p>
          </div>

          <div style="padding: 30px; color: #333;">
            <p style="font-size: 16px;">Hi there 👋,</p>
          

            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: #009900; color: white; padding: 14px 30px; border-radius: 8px; font-size: 22px; letter-spacing: 4px; font-weight: bold;">
                ${subject}
              </div>
            </div>

            
          </div>

          <div style="background: #f0f4f8; text-align: center; padding: 15px; font-size: 12px; color: #888;">
            © ${new Date().getFullYear()} Trash Beta. All rights reserved.<br/>
            <a href="https://trashbeta.onrender.com" style="color: #009900; text-decoration: none;">Visit Website</a>
          </div>
        </div>
      </div>
    `;

    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL, // no-reply@medcheck.store
      to,
      subject: "TrashBeta Notification",
      html: htmlContent
    });

    //console.log(`✅ OTP email sent to ${to}: ${otp}`);
    //console.log("Resend response:", data);
    return data;
  } catch (err) {
    console.error("❌ Error sending OTP email:", err);
    throw err;
  }
};

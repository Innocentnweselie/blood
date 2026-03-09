import nodemailer from 'nodemailer';

const sendEmail = async ({ email, subject, message }) => {
  try {
    let transporter;

    const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST;
    const smtpPortRaw = process.env.SMTP_PORT || process.env.EMAIL_PORT;
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USERNAME;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
    const smtpPort = smtpPortRaw ? Number(smtpPortRaw) : 587;
    const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

    if (smtpHost && smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } else {
      // Fallback to an Ethereal test account for local development
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: process.env.FROM_EMAIL || smtpUser || 'no-reply@medtracker.local',
      to: email,
      subject,
      text: message,
    };

    const info = await transporter.sendMail(mailOptions);

    // If using Ethereal, output preview URL to console for convenience
    if (nodemailer.getTestMessageUrl && !process.env.SMTP_HOST) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (err) {
    console.error('sendEmail error:', err);
    throw err;
  }
};

export default sendEmail;

const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  try {
    // Create Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"WEintegrity Technologies" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    // Email error - monitoring handled elsewhere
    throw error;
  }
};

module.exports = { sendEmail };

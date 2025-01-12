const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmail(options) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      };

      const info = await this.transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendAlertEmail(alertData) {
    const html = `
      <h2>Security Alert</h2>
      <p><strong>Type:</strong> ${alertData.type}</p>
      <p><strong>Severity:</strong> ${alertData.severity}</p>
      <p><strong>Timestamp:</strong> ${new Date(alertData.timestamp).toLocaleString()}</p>
      <p><strong>Details:</strong></p>
      <pre>${JSON.stringify(alertData, null, 2)}</pre>
    `;

    return this.sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `Security Alert: ${alertData.type}`,
      html
    });
  }
}

module.exports = new EmailService(); 
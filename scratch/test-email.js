const dotenv = require('dotenv');
const path = require('path');
const nodemailer = require('nodemailer');

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testEmail() {
  console.log('Testing Email Configuration...');
  console.log('Host:', process.env.EMAIL_HOST);
  console.log('User:', process.env.EMAIL_USER);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // Send to self
      subject: 'Test Order Email Connection',
      text: 'If you received this, your Flexwear Store email credentials are working correctly.',
      html: '<h1>Connection Successful</h1><p>Your Flexwear Store email credentials are working correctly.</p>',
    });
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending test email:', error.message);
    console.log('\nNOTE: If you haven\'t added valid credentials to .env yet, this error is expected.');
  }
}

testEmail();

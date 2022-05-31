const nodemailer = require('nodemailer');
const { MAILER_PASSWORD } = require('../config');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'trinosapihelymar@gmail.com',
    pass: MAILER_PASSWORD,
  },
});

module.exports = transporter;

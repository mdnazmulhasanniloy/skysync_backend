import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import config from '../config';

export const sendEmail = async (to: string, subject: string, html: string) => {
  const transportOptions: SMTPTransport.Options = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    //@ts-ignore
    family: 4, // force IPv4
    auth: {
      user: config.nodemailer_host_email,
      pass: config.nodemailer_host_pass,
    },
  };

  const transporter = nodemailer.createTransport(transportOptions);

  try {
    await transporter.verify();
    console.log('SMTP VERIFIED');
  } catch (err) {
    console.error('VERIFY ERROR =>', err);
  }

  await transporter.sendMail({
    from: config.nodemailer_host_email,
    to,
    subject,
    text: '',
    html,
  });
};

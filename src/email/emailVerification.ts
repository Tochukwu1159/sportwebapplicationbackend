export function emailVerificationView(token: string): string {
  const link = `${process.env.BACKEND_URL}/users/verify/${token}`;
  let temp = `
     <div style='max-width: 700px;
     margin:auto; border: 10px solid #ddd; padding: 45px 30px; font-size: 110%;'>
     <h2 style='text-align: center; text-transform: uppercase;color: teal;'>Welcome to sports arena.</h2>
      <p> click on the button to verify your email
      </p>
       <a href=${link}
       style='background: crimson; text-decoration: none; color: blue;
        padding: 10px 20px; margin: 10px 0;
       display: inline-block;'>Click here</a>
      </div>
      `;
  return temp;
}

export function forgotPasswordVerification(id: string): string {
  const link = `${process.env.FRONTEND_URL}/reset-password/${id}`;
  let temp = `
     <div style='max-width: 700px;
     margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;'>
     <h3 style='text-align: center; text-transform: uppercase;color: teal;'>We received a request
     to reset your password</h3>
      <p>Use the link below to set up the new password for your account
       ignore this email and the link will expire on its own
      </p>
       <a href=${link}
       style='background: crimson; text-decoration: none; color: blue;
        padding: 10px 20px; margin: 10px 0;
       display: inline-block;'>Click this button</a>
      </div>
      `;
  return temp;
}


import nodemailer from 'nodemailer';
const forMailUser = process.env.GMAIL_USER as string;
const forMailPass = process.env.GMAIL_PASS as string;
const fromUser = process.env.FROM as string;
const userSubject = process.env.SUBJECT as string;

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: forMailUser,
    pass: forMailPass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
export const sendEmail = (from:string, to:string, subject: string, html: string):Promise<unknown> => {
    return new Promise((resolve, reject) => {
      transport.sendMail(
        { from: fromUser, subject: userSubject, to, html },
        (err, info) => {
          if (err) reject(err);
          resolve(info);
        },
      );
    });
  }
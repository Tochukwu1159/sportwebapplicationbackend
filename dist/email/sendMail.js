"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const nodemailer_1 = __importDefault(require("nodemailer"));
const forMailUser = process.env.GMAIL_USER;
const forMailPass = process.env.GMAIL_PASS;
const fromUser = process.env.FROM;
const userSubject = process.env.SUBJECT;
const transport = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: forMailUser,
        pass: forMailPass,
    },
    tls: {
        rejectUnauthorized: false,
    },
});
module.exports = {
    //await Mailer.sendEmail(fromUser, subject, req.body.email,  html);
    sendEmail(from, to, subject, html) {
        return new Promise((resolve, reject) => {
            transport.sendMail({ from: fromUser, subject: userSubject, to, html }, (err, info) => {
                if (err)
                    reject(err);
                resolve(info);
            });
        });
    },
};
// import config from 'dotenv';
// import nodemailer from 'nodemailer';
// config.config();
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   host: 'smtp.gmail.com',
//   secure: false,
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_PASS,
//   },
// });
//Rider verification
// export = {
//   verifyUserEmail: async (email: string, token: string) => {
//     const link = `${process.env.ROOT_URL}/verify/${token}`;
//     const temp = `
//      <div style="max-width: 700px;
//      margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
//      <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome Sports Arena</h2>
//       <p>Dear Customer, Follow the link by clicking on the button to verify your email
//       </p>
//        <a href=${link}
//        style="background: crimson; text-decoration: none; color: white;
//         padding: 10px 20px; margin: 10px 0;
//        display: inline-block;">Click here</a>
//       </div>
//       `;
//     const mailOptions = {
//       from: process.env.GMAIL_USER,
//       to: email,
//       subject: 'Verify your email',
//       html: temp,
//     };
//     transporter.sendMail(mailOptions, (err: any, info: any) => {
//       if (err) {
//         console.log(err);
//       } else {
//         console.log('Email sent: ' + info.response);
//       }
//     });
//   },
// };

const nodemailer = require("nodemailer");
const { MAIL_HOST, MAIL_ADDRESS, MAIL_PASSWORD } = require("../config/env");

const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  service: "gmail",
  secure: true,
  auth: {
    user: MAIL_ADDRESS,
    pass: MAIL_PASSWORD,
  },
});

const mailer = (object) => {
  const mailOptions = {
    from: MAIL_ADDRESS,
    to: object?.email,
    subject: object?.subject,
    html: object?.message,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
      // do something useful
    }
  });
};

module.exports = mailer;

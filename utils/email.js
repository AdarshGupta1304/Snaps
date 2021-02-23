const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1) create a Transporter
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.MAIL_ID,
            pass: process.env.PASS
        }

    });

    // 2) Define a email options
    const mailOptions = {
        from: 'Adarsh Gupta <87adarsh.gupta@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    // 3) send the email
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
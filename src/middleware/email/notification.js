var nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'cadrewill.mailer@gmail.com',
        pass: 'zcHfhgHgE3NYn4R9'
    }
});

const sendMail = async ({
    email,
    message,
    subject
}) => {
    var mailOptions = {
        from: 'cadrewill.mailer@gmail.com',
        to: email,
        subject: subject,
        text: `${message}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
module.exports = sendMail

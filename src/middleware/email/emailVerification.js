var nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'cadrewill.mailer@gmail.com',
        pass: 'zcHfhgHgE3NYn4R9'
    }
});


const sendMail = async ({ email,token, username,}) => {
    var mailOptions = {
        from: 'cadrewill.mailer@gmail.com',
        to: email,
        subject: 'Email Verification',
        text: `Welcome ${username}.This is a email varification alert,if You have not signed up to this site please ignore this message.`,
        html: `<a href='https://cadrewill.com/verify?token=${token}' style='width:50px;margin:auto'>Verify</a>`
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

var nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'cadrewill.mailer@gmail.com',
        pass: 'zcHfhgHgE3NYn4R9'
    }
});

const sendMail = async ({email,course}) => {
    var mailOptions = {
        from: 'cadrewill.mailer@gmail.com',
        to: email,
        subject: 'Course Registration',
        text: `You have been successfully registered to course ${course}.For any query please contact us.`
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

var nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'cadrewill.mailer@gmail.com',
        pass: 'zcHfhgHgE3NYn4R9'
    }
});




const sendMail = async() =>{
    var mailOptions = {
        from: 'rootrsk@gmail.com',
        to: 'ravishankar7050@gmail.com',
        subject: 'Welcome message',
        text: `This is welcome mesage from rootrsk because you have join our site`
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

const nodemailer = require("nodemailer");

var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "trialjust71@gmail.com",
        pass: "Mohit@2001",
    },
});

module.exports.sendResetEmail = async (email, token) => {
    // change first part to your domain
    var url = "http://localhost:3000/resetPassword?token=" + token;

    await smtpTransport.sendMail({
        from: "trialjust71@gmail.com",
        to: email,
        subject: "RESET YOUR PASSWORD",
        text: `Click on this link to reset your password ${url}`,
        html: `<h3> Click on this link to reset your password : ${url} </h3>`,
    });
};

module.exports.sendVerifyEmail = async (email, token) => {
    // change first part to your domain
    var url = "http://localhost:3000/verifyemail?token=" + token;

    await smtpTransport.sendMail({
        from: "trialjust71@gmail.com",
        to: email,
        subject: "VERIFY Your EMAIL",
        text: `Click on this link to verify ${url}`,
        html: `<h3> Click on this link to verify your email : ${url} </h3>`,
    });
};


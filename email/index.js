var nodemailer = require("nodemailer");
var config = require('../config')

//配置邮件
var transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: config.email.auth
});
//发送邮件
var sendmail = function(data) {
  var option = {
    from: config.email.auth.user,
    to: "leasing@l-region.com",
    subject: "客户预约了，快来查看吧！",
    html: `<h1>预约客户信息:</h1><p>姓名：${data.username}</p><p>邮箱：${data.email}</p><p>手机号码：${data.tel}</p><p>预约中心：${data.center}</p>`
  };
  transporter.sendMail(option, function(error, response) {
    if (error) {
      console.log("fail: " + error);
    } else {
      console.log("success: " + response.message);
    }
  });
};

module.exports = sendmail

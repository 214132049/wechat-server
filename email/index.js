var nodemailer = require("nodemailer");
var config = require('../config')

//配置邮件
var transporter = nodemailer.createTransport({
  // host: config.email.host,
  service: "qq",
  port: 465,
  secureConnection: config.email.secureConnection,
  auth: config.email.auth
});
//发送邮件
var sendmail = function(data) {
  var option = {
    from: config.email.auth.user,
    to: "214132049@qq.com",
    subject: "客户预约了，快来查看吧！",
    html: `<h1>预约客户信息:</h1><p>姓名：${data.username}</p><p>邮箱：${data.email}</p><p>手机号码：${data.tel}</p>`
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

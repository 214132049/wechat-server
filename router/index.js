var Router = require("koa-router");
var xlsx = require('node-xlsx');
var fs = require("fs-extra");
var sha1 = require('sha1');
var path = require("path");
var config = require("../config");
var Wechat = require("../wechat");
var sendEmail = require('../email')

var router = new Router();
var wechat = new Wechat(config.wechat);

var excel_file = path.join(__dirname, "../data/record.xlsx");

router.get('/api/', async (ctx, next) => {
  var signature = ctx.query.signature || ''
  var nonce = ctx.query.nonce || ''
  var timestamp = ctx.query.timestamp || ''
  var echostr = ctx.query.echostr || ''

  var token = config.wechat.token || ''
  var str = [token, timestamp, nonce].sort().join('')
  var sha = sha1(str)
  ctx.body = (sha === signature) ? echostr + '' : 'failed'
})

router.post("/api/sign", async (ctx, next) => {
  var token = await wechat.fetchAccessToken();
  var ticket = await wechat.fetchTicket(token);
  var body = {}
  if (!token || !ticket) {
    body = { code: -1, data: {} }
  } else {
    body = { code: 1, data: wechat.sign(ticket.ticket, ctx.request.body.url) };
  }
  ctx.status = 200;
  ctx.type = "application/json";
  ctx.body = body;
  next();
});

router.post("/api/submit", async (ctx, next) => {
  //读取文件内容
  var cb = ctx.request.query.callback
  var body = ctx.request.body;
  var sheet = xlsx.parse(excel_file);
  var excelObj = sheet[0].data;
  if (excelObj.length == 0) {
    excelObj.push(["姓名", "邮箱", "手机号码", "预约中心"]);
  }
  var data = excelObj.concat([Object.values(body)]);
  var buffer = xlsx.build([{ name: "sheet1", data: data }]);
  await fs
    .writeFile(excel_file, buffer, { flag: "w" })
    .then(() => sendEmail(body))
    .then(() => {
      if (cb) {
        ctx.type = 'text';
        ctx.body = cb + '(' + JSON.stringify({code: 1}) + ')'
      } else {
        ctx.body = {code: 1}
      }
    })
    .catch(() => {
      if (cb) {
        ctx.type = 'text';
        ctx.body = cb + '(' + JSON.stringify({code: -1}) + ')'
      } else {
        ctx.body = {code: -1}
      }
    });
});

module.exports = router
var koa = require("koa2");
var cors = require('koa2-cors');
var koaBody = require("koa-body");
var router = require('./router')

var app = new koa();

app.use(koaBody({ multipart: true }));
app.use(cors({
  origin: function (ctx) {
    return "http://www.l-region.com"; 
  },
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'POST'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.use(router.routes()).use(router.allowedMethods());

app.listen(8080);
console.log("listening on port 8080");

// L-reGion
// lregion2018v5

// 线上
// "appID": "wxd11aa3c044d611da", 
// "appSecret": "69ee5f2423583496cac17bb149ac2bee",

// 测试账号
// appID wx391c5e7924df4bae
// appsecret  09793c8791598a597841525cac16e5f8

//ip 106.14.140.51
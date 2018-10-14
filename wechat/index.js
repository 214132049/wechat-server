var axios = require("axios");
var path = require("path");
var fs = require("fs-extra");
var sha1 = require('sha1');
var config = require("../config.json");

var token_file = path.join(__dirname, "../wechatFiles/accessToken.json");
var ticket_file = path.join(__dirname, "../wechatFiles/ticket.json");
var api = {
  access_token: config.wechat.prefix + "token",
  ticket: config.wechat.prefix + "ticket/getticket"
};

var createNonce = function () {
  return Math.random().toString(36).substr(2, 15)
}
//生成时间戳
var createTimestamp = function () {
  return parseInt(new Date().getTime() / 1000)
}
var _sign = function (noncestr, ticket, timestamp, url) {
  var params = [
    'jsapi_ticket=' + ticket,
    'noncestr=' + noncestr,
    'timestamp=' + timestamp + '',
    'url=' + url
  ];
  var str = sha1(params.sort().join('&'));   //将参数排序然后用&进行字符串连接
  return str;
}


class Wechat {
  constructor(opts = {}) {
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.jsapiTicket = '';
    this.access_token = '';
    this.fetchAccessToken();
  }
  async fetchTicket(token) {
    var ticket = await fs.readJson(ticket_file, { throws: false });
    if (ticket && this.isValidTicket(ticket)) return ticket;
    return axios.get(api.ticket, {
      params: {
        access_token: token.access_token,
        type: "jsapi"
      }
    })
    .then(({ data }) => ({ ...data, expires_in: new Date().getTime() +(data.expires_in - 20) * 1000 }))
    .then(data => {
      return fs.writeJson(ticket_file, data, { flag: "w" }).then(() => data)
    })
    .then(data => {
      this.jsapiTicket = data.jsapiTicket || "";
      return data
    })
    .catch((err) => console.log(err))
  }
  async fetchAccessToken() {
    var token = await fs.readJson(token_file, { throws: false });
    if (token && token.expires_in > new Date().getTime()) return token;
    return axios.get(api.access_token, {
      params: {
        grant_type: "client_credential",
        appid: config.wechat.appID,
        secret: config.wechat.appSecret
      }
    })
    .then(({ data }) => ({ ...data, expires_in: new Date().getTime() + 7100 * 1000 }))
    .then(data => {
      return fs.writeJson(token_file, data, { flag: "w" }).then(() => data)
    })
    .then(data => {
      this.access_token = data.access_token || "";
      return data
    })
    .catch((err) => console.log(err))
  }
  isValidTicket(data) {
    if (!data || !data.ticket || !data.expires_in) {
      return false
    }
    var now = new Date().getTime()
    //当前时间小于有效期即为有效
    return (data.ticket && now < data.expires_in) ? true : false;
  }
  //生成随机字符串
  sign(ticket, url) {
    var noncestr = createNonce();
    var timestamp = createTimestamp();
    var signature = _sign(noncestr, ticket, timestamp, url);
    return {
      appid: config.wechat.appID,
      noncestr: noncestr,
      timestamp: timestamp,
      signature: signature
    }
  }
}

module.exports = Wechat;

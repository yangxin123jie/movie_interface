var express = require("express");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var path = require("path");
// apiRouter为后台接口
var apiRouter = require("./routes/apiRouter");
// frontRouter为前台接口
var frontRouter = require("./routes/frontRouter");

var Db = require("./db/db");
var app = express();
//解决跨域
app.all("*",function(req,res,next){
  //设置允许跨域的域名，*代表允许任意域名跨域
  res.header("Access-Control-Allow-Origin","*");
  //允许的header类型
  res.header("Access-Control-Allow-Headers","content-type");
  //跨域允许的请求方式 
  res.header("Access-Control-Allow-Methods","DELETE,PUT,POST,GET,OPTIONS");
  if (req.method.toLowerCase() == 'options')
      res.send(200);  //让options尝试请求快速结束
  else
      next();
})


app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// 前台接口
app.use("/api", frontRouter);

app.use((req, res, next) => {
  console.log(req.url);
  if (req.headers.token) {
    let db = new Db("wanda");
    db.findById({
      model_name: "adminuser",
      id: req.headers.token,
      callback: rst => {
        if (!rst.result) {
          res.send({
            error_code: 403,
            reason: "账号不存在",
            result: null
          });
        } else if (Date.now() > rst.result.expires) {
          res.send({
            error_code: 402,
            reason: "token已过期，请重新登录",
            result: null
          });
        } else {
          next();
        }
      }
    });
  } else if (req.url != "/api/admin/login") {
    res.send({
      error_code: 401,
      reason: "您还没有登录,请先登录",
      result: null
    });
  } else {
    next();
  }
});
// 后台接口
app.use("/api", apiRouter);

module.exports = app;

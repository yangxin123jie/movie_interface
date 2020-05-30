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

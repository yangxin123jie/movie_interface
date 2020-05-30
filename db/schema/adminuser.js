var mongoose = require("mongoose");
var crypto = require("crypto");
var Schema = mongoose.Schema;

function md5(password) {
  let md5hamc = crypto.createHmac("md5", "baofeng");
  md5hamc.update(password);
  return md5hamc.digest("hex");
}
// 管理员模型
var schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    default: md5("000000")
  },
  role: {
    required: true,
    type: mongoose.Types.ObjectId,
    ref: "role"
  },
  // 令牌
  token: {
    type: String
    // unique: true
  },
  // 令牌过期时间
  expires: {
    type: Number,
    default: new Date(Date.now() + 1000 * 60 * 60).getTime()
  }
});

module.exports = schema;

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// 权限模型
var schema = new Schema({
  // 影片名称
  moviename: {
    type: String,
    default: 0,
    required: true
  },
  // 影片描述
  moviedes: {
    type: String
  },
  // 影片封面图
  moviecover: {
    type: String
  },
  //   cinemaid
  cinema: {
    required: true,
    type: mongoose.Types.ObjectId,
    ref: "cinema"
  }
});

module.exports = schema;

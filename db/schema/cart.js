var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// 权限模型
var schema = new Schema({
  good_id: String,
  price: String,
  name: String,
  num: Number,
  imgurl: String
});

module.exports = schema;

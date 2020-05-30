var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// 城市列表模型
var schema = new Schema({
  id: String,
  city_name: String,
  city_pre: String,
  city_pinyin: String,
  city_short: String,
  count: String
});
module.exports = schema;

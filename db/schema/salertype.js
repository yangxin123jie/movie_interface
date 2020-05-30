var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// 卖品分类
var schema = new Schema({
  salertype: {
    type: String,
    required: true,
    unique: true
  }
});

module.exports = schema;

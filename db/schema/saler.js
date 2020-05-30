var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// 卖品分类
var schema = new Schema({
  //   名称
  salertitle: {
    type: String,
    required: true
  },
  //   描述
  salerdes: {
    type: String
  },
  //   单价
  salerrpice: {
    type: Number,
    default: 0
  },
  //   卖品图片
  salerimg: {
    type: String
  },
  //  类别id
  salertype: {
    required: true,
    type: mongoose.Types.ObjectId,
    ref: "salertype"
  },
  //   cinemaid
  cinema: {
    required: true,
    type: mongoose.Types.ObjectId,
    ref: "cinema"
  }
});

module.exports = schema;

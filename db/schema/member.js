var mongoose = require("mongoose");
var Schema = mongoose.Schema;
// 会员模型
var schema = new Schema({
  mobile: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: val => {
        return /^1[35789]\d{9}$/.test(val);
      }
    }
  },
  password: {
    type: String,
    required: true
  }
});

module.exports = schema;

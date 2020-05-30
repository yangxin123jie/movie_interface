var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// 影院列表模型
var schema = new Schema({
  cinema_name: {
    type: String,
    required: true
  },
  cinema_address: String,
  city: {
    required: true,
    type: mongoose.Types.ObjectId,
    ref: "city"
  }
});
module.exports = schema;

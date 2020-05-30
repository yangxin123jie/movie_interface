var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// 角色模型
var schema = new Schema({
  // 角色名称
  rolename: {
    type: String,
    required: true,
    unique: true
  },
  // 角色对应的权限列表
  limit: [
    {
      required: true,
      type: mongoose.Types.ObjectId,
      ref: "limit"
    }
  ]
});

module.exports = schema;

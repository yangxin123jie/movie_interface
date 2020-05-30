var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// 权限模型
var schema = new Schema({
  // 父节点id,如果没有父节点(顶级节点))，默认为0
  pid: {
    type: String,
    default: 0,
    required: true
  },
  // 标题名字
  title: {
    type: String,
    required: true
  },
  // limitname存储路由路径
  limitname: {
    type: String
  }
});

module.exports = schema;

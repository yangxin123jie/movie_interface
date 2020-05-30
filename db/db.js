var mongoose = require("mongoose");

class Db {
  constructor(dbname) {
    this.url = `mongodb://127.0.0.1:27017/${dbname}`;
  }
  connect() {
    var p = new Promise((resolve, reject) => {
      // 防止反复连接
      if (mongoose.connection.readyState == 1) {
        resolve();
        return;
      }
      mongoose.connect(
        this.url,
        { useNewUrlParser: true, useUnifiedTopology: true },
        err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
    return p;
  }
  // 处理model和schema同名
  findModel(model_name) {
    let schema_name = model_name;
    // switch (model_name) {
    //   case "hot":
    //   case "recommend":
    //     schema_name = "film";
    //     break;

    //   default:
    //     break;
    // }
    let schema = require(`./schema/${schema_name}`);
    // 创建model
    var model = mongoose.model(model_name, schema);
    return model;
  }
  // 普通查询
  async find({ model_name = "", query = {}, callback } = {}) {
    try {
      await this.connect();
      this.findModel(model_name).find(query, (err, rst) => {
        if (err) {
          callback({ error_code: 101, reason: "查询失败", result: err });
        } else {
          callback({ error_code: 0, reason: "查询成功", result: rst });
        }
      });
    } catch (err) {
      // 连接失败
      callback({ error_code: 102, reason: "连接失败", result: err });
    }
  }
  // 嵌套连接查询(多个集合嵌套关联的情况)
  async populate({
    model_name = "",
    query = {},
    refs = [],
    skip = 0,
    limit = 5,
    sort = {},
    callback
  } = {}) {
    try {
      await this.connect();
      // 动态schema
      refs.forEach(ref => {
        this.findModel(ref);
      });
      // 动态生成递归模式的populate
      var populates = [];
      refs.forEach(ref => {
        var populate = {};
        populate.path = ref;
        populates.push(populate);
      });
      // populates = populates.reverse();
      for (let i = 0; i < populates.length - 1; i++) {
        populates[i].populate = populates[i + 1];
      }

      // console.log(populates[0]);

      this.findModel(model_name)
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .populate(populates[0])
        .exec((err, rst) => {
          if (err) {
            callback({ error_code: 101, reason: "查询失败", result: err });
          } else {
            callback({ error_code: 0, reason: "查询成功", result: rst });
          }
        });
    } catch (err) {
      // 连接失败
      callback({ error_code: 102, reason: "连接失败", result: err });
    }
  }
  // 合并连接查询(连接多个集合的情况)
  async combinePopulate({
    model_name = "",
    query = {},
    refs = [],
    skip = 0,
    limit = 5,
    sort = {},
    callback
  } = {}) {
    try {
      await this.connect();
      // 动态schema
      refs.forEach(ref => {
        this.findModel(ref);
      });

      var populates = [];
      refs.forEach(ref => {
        var populate = {};
        populate.path = ref;
        populates.push(populate);
      });
      let model = this.findModel(model_name)
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort(sort);
      populates.forEach(pop => {
        model.populate(pop);
      });
      model.exec((err, rst) => {
        if (err) {
          callback({ error_code: 101, reason: "查询失败", result: err });
        } else {
          callback({ error_code: 0, reason: "查询成功", result: rst });
        }
      });
    } catch (err) {
      // 连接失败
      callback({ error_code: 102, reason: "连接失败", result: err });
    }
  }
  // 根据id查询数据
  async findById({ model_name = "", id = "", callback } = {}) {
    try {
      await this.connect();
      this.findModel(model_name).findById(id, (err, rst) => {
        if (err) {
          callback({ error_code: 101, reason: "查询失败", result: err });
        } else {
          callback({ error_code: 0, reason: "查询成功", result: rst });
        }
      });
    } catch (err) {
      // 连接失败
      callback({ error_code: 102, reason: "连接失败", result: err });
    }
  }
  // skip = (page-1)*limit
  // 分页查询数据
  async pagination({
    model_name = "",
    query = {},
    skip = 0,
    limit = 5,
    sort = {},
    callback
  } = {}) {
    try {
      await this.connect();
      this.findModel(model_name)
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .exec((err, rst) => {
          if (err) {
            callback({ error_code: 101, reason: "查询失败", result: err });
          } else {
            callback({ error_code: 0, reason: "查询成功", result: rst });
          }
        });
    } catch (err) {
      // 连接失败
      callback({ error_code: 102, reason: "连接失败", result: err });
    }
  }
  // 查询数量
  async count({ model_name = "", query = {}, callback } = {}) {
    try {
      await this.connect();
      this.findModel(model_name).count(query, (err, rst) => {
        if (err) {
          callback({ error_code: 101, reason: "查询失败", result: err });
        } else {
          callback({ error_code: 0, reason: "查询成功", result: rst });
        }
      });
    } catch (err) {
      // 连接失败
      callback({ error_code: 102, reason: "连接失败", result: err });
    }
  }

  // 新增数据
  async insert({ model_name = "", data = {}, callback } = {}) {
    try {
      await this.connect();
      this.findModel(model_name).insertMany(data, (err, rst) => {
        if (err) {
          callback({ error_code: 101, reason: "新增失败", result: err });
        } else {
          callback({ error_code: 0, reason: "新增成功", result: rst });
        }
      });
    } catch (err) {
      // 连接失败
      callback({ error_code: 102, reason: "连接失败", result: err });
    }
  }
  // 更新数据
  async update({ model_name = "", query = {}, data = {}, callback } = {}) {
    try {
      await this.connect();
      this.findModel(model_name).updateMany(
        query,
        { $set: data },
        (err, rst) => {
          if (err) {
            callback({ error_code: 101, reason: "修改失败", result: err });
          } else {
            callback({ error_code: 0, reason: "修改成功", result: rst });
          }
        }
      );
    } catch (err) {
      // 连接失败
      callback({ error_code: 102, reason: "连接失败", result: err });
    }
  }
  // 删除数据
  async delete({ model_name = "", query = {}, callback } = {}) {
    try {
      await this.connect();
      this.findModel(model_name).deleteMany(query, (err, rst) => {
        if (err) {
          callback({ error_code: 101, reason: "删除失败", result: err });
        } else {
          callback({ error_code: 0, reason: "删除成功", result: rst });
        }
      });
    } catch (err) {
      // 连接失败
      callback({ error_code: 102, reason: "连接失败", result: err });
    }
  }
  close() {
    mongoose.disconnect();
  }
}

module.exports = Db;

// let db = new Db("wanda");
// db.combinePopulate({
//   model_name: "saler",
//   refs: ["salertype", "cinema"],
//   skip: 0,
//   limit: 5,
//   callback: rst => {
//     console.log(rst.result);
//   }
// });
// db.populate({
//   model_name: "cinema",
//   refs: ["city"], //要注意ref的依赖次序，不能错
//   callback: rst => {
//     console.log(rst);
//   }
// });

var express = require("express");
var crypto = require("crypto");
var Db = require("../db/db");
var router = express.Router();
var db = new Db("wanda");

// model常量定义

const MODEL_LIMIT = "limit"; //权限
const MODEL_ROLE = "role"; //角色
const MODEL_ADMIN_USER = "adminuser"; //管理用户

/***********************************后台操作接口*************************************/

/*****************权限操作******************/
// 新增权限
router.post("/admin/addlimit", function(req, res) {
  let { pid, limitname, title } = req.body;
  db.insert({
    model_name: MODEL_LIMIT,
    data: { pid, limitname, title },
    callback: rst => {
      res.send(rst);
    }
  });
});
// 修改权限
router.post("/admin/updatelimit", function(req, res) {
  let { _id, pid, limitname, title } = req.body;
  db.update({
    model_name: MODEL_LIMIT,
    query: { _id },
    data: { pid, limitname, title },
    callback: rst => {
      res.send(rst);
    }
  });
});
// 删除权限
router.post("/admin/deletelimit", function(req, res) {
  let { _id } = req.body;
  db.delete({
    model_name: MODEL_LIMIT,
    query: { _id },
    callback: rst => {
      res.send(rst);
    }
  });
});
// 查询权限（分页查询）
router.get("/admin/getlimit", function(req, res) {
  let { currpage } = req.query;
  db.pagination({
    model_name: MODEL_LIMIT,
    skip: (currpage - 1) * 5,
    limit: 5,
    callback: rst => {
      res.send(rst);
    }
  });
});
// 查询权限（所有）
router.get("/admin/getlimitall", function(req, res) {
  db.find({
    model_name: MODEL_LIMIT,
    callback: rst => {
      res.send(rst);
    }
  });
});
// 查询权限列表数据条数
router.get("/admin/getlimitcount", function(req, res) {
  db.count({
    model_name: MODEL_LIMIT,
    callback: rst => {
      res.send(rst);
    }
  });
});

/*****************角色操作******************/

// 新增角色
router.post("/admin/addrole", function(req, res) {
  // limit为权限的id，注意是ObjectId类型
  let { rolename, limit } = req.body;
  db.insert({
    model_name: MODEL_ROLE,
    data: { rolename, limit },
    callback: rst => {
      res.send(rst);
    }
  });
});
// 修改角色
router.post("/admin/updaterole", function(req, res) {
  // limit为权限的id，注意是ObjectId类型
  let { _id, rolename, limit } = req.body;
  db.update({
    model_name: MODEL_ROLE,
    query: { _id },
    data: { rolename, limit },
    callback: rst => {
      res.send(rst);
    }
  });
});
// 删除角色
router.post("/admin/deleterole", function(req, res) {
  let { _id } = req.body;
  db.delete({
    model_name: MODEL_ROLE,
    query: { _id },
    callback: rst => {
      res.send(rst);
    }
  });
});
// 查询角色（分页查询）
router.get("/admin/getrole", function(req, res) {
  let { currpage } = req.query;
  db.pagination({
    model_name: MODEL_ROLE,
    skip: (currpage - 1) * 5,
    limit: 5,
    callback: rst => {
      res.send(rst);
    }
  });
});
// 查询角色
router.get("/admin/getallrole", function(req, res) {
  db.find({
    model_name: MODEL_ROLE,
    callback: rst => {
      res.send(rst);
    }
  });
});
// 查询角色列表数据条数
router.get("/admin/getrolecount", function(req, res) {
  db.count({
    model_name: MODEL_ROLE,
    callback: rst => {
      res.send(rst);
    }
  });
});

/*****************管理员操作******************/

// 加密密码
function md5(password) {
  let md5hamc = crypto.createHmac("md5", "baofeng");
  md5hamc.update(password);
  return md5hamc.digest("hex");
}

router.post("/admin/adduser", function(req, res) {
  // 用户名，密码，role角色id

  let { username, password,role } = req.body;
  // password = md5(password)
  password = password
  db.insert({
    model_name: MODEL_ADMIN_USER,
    data: { username,password, role },
    callback: rst => {
      console.log(rst);
      res.send(rst);
    }
  });
});
// 修改管理员
router.post("/admin/updateuser", function(req, res) {
  // 注意role为角色id
  let { _id, username, role } = req.body;
  db.update({
    model_name: MODEL_ADMIN_USER,
    query: { _id },
    data: { username, role },
    callback: rst => {
      res.send(rst);
    }
  });
});
// 删除管理员
router.post("/admin/deleteuser", function(req, res) {
  let { _id } = req.body;
  db.delete({
    model_name: MODEL_ADMIN_USER,
    query: { _id },
    callback: rst => {
      res.send(rst);
    }
  });
});
// 管理员列表查询
// router.get("/admin/getalladminuser", function(req, res) {
//   db.find({
//     model_name: MODEL_ADMIN_USER,
//     callback: rst => {
//       res.send(rst);
//     }
//   });
// });
router.get("/admin/getalladminuser", function(req, res) {
  db.populate({
    model_name: MODEL_ADMIN_USER,
    refs: ["role", "limit"], //要注意ref的依赖次序，不能错
    callback: rst => {
      res.send(rst);
    }
  });
});
router.get("/admin/getadminuser", function(req, res) {
  let { currpage } = req.query;
  db.populate({
    model_name: MODEL_ADMIN_USER,
    refs: ["role", "limit"],
    skip: (currpage - 1) * 5,
    limit: 5,
    callback: rst => {
      res.send(rst);
    }
  });
});
// 查询用户（分页查询）
// router.get("/admin/getadminuser", function(req, res) {
//   let { currpage } = req.query;
//   db.pagination({
//     model_name: MODEL_ADMIN_USER,
//     skip: (currpage - 1) * 5,
//     limit: 5,
//     callback: rst => {
//       res.send(rst);
//     }
//   });
// });
// 查询用户列表数据条数
router.get("/admin/getadminusercount", function(req, res) {
  db.count({
    model_name: MODEL_ADMIN_USER,
    callback: rst => {
      res.send(rst);
    }
  });
});
// 通过_id查询当前管理员信息(主要查询关联的权限信息)
router.get("/admin/getadminuserbyid", function(req, res) {
  let { _id } = req.query;
  db.populate({
    model_name: MODEL_ADMIN_USER,
    query: { _id },
    refs: ["role", "limit"],
    callback: rst => {
      res.send(rst);
    }
  });
});
// 管理员登录
router.post("/admin/login", function(req, res) {
  let { username, password } = req.body;
  // password = md5(password);
  password = password;
  db.find({
    model_name: MODEL_ADMIN_USER,
    query: { username, password },
    callback: rst => {
      if (rst.result.length > 0) {
        let id = rst.result[0]._id;
        // 登录成功把token更新上去
        db.update({
          model_name: MODEL_ADMIN_USER,
          query: { username },
          data: {
            token: id,
            expires: new Date(Date.now() + 1000 * 60 * 60).getTime()
            // expires: new Date(Date.now() + 1000 * 20).getTime()
          },
          callback: urst => {
            res.send(rst);
          }
        });
      } else {
        res.send({ error_code: 101, reason: "用户名或密码错误", result: null });
      }
    }
  });
});
// 通过_id查询当前管理员信息(主要查询关联的权限信息)
router.get("/admin/getpassword", function(req, res) {
  let { _id } = req.query;
  db.find({
    model_name: MODEL_ADMIN_USER,
    query: { _id },
    callback: rst => {
      res.send(rst);
    }
  });
});
module.exports = router;

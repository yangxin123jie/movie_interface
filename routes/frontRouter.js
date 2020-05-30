var express = require("express");
var Db = require("../db/db");
var formidable = require("formidable");
var path = require("path");
var fs = require("fs");
var crypto = require("crypto");

var router = express.Router();
var db = new Db("wanda");

const MODEL_CITY = "city"; //城市列表
const MODEL_CINEMA = "cinema"; //影院列表
const MODEL_MOVIE = "movie"; //影院列表
const MODEL_SALERTYPE = "salertype"; //卖品分类
const MODEL_SALER = "saler"; //卖品
const MODEL_MEMBER = "member"; //会员

// 加密密码
function md5(password) {
  let md5hamc = crypto.createHmac("md5", "baofeng");
  md5hamc.update(password);
  return md5hamc.digest("hex");
}
/***********************************前台操作接口*************************************/

/*****************城市列表操作******************/

// 城市列表查询(城市列表直接把json导入进去)
router.get("/citys", function(req, res) {
  db.find({
    model_name: MODEL_CITY,
    callback: rst => {
      res.send(rst);
    }
  });
});

/*****************影院列表操作******************/

// 城市对应的影院信息(影院是与城市关联的，每个城市有不同的影院，一对多关联关系)

// 新增影院信息
router.post("/addcinemas", function(req, res) {
  let { cinema_name, cinema_address, cityid: city } = req.body;
  db.insert({
    model_name: MODEL_CINEMA,
    data: { cinema_name, cinema_address, city },
    callback: rst => {
      console.log(rst);
      res.send(rst);
    }
  });
});
// 修改影院信息
router.post("/updcinemas", function(req, res) {
  let { _id, cinema_name, cinema_address, cityid: city } = req.body;
  db.update({
    model_name: MODEL_CINEMA,
    query: { _id },
    data: { cinema_name, cinema_address, city },
    callback: rst => {
      res.send(rst);
    }
  });
});
// 删除影院信息
router.post("/delcinemas", function(req, res) {
  let { _id } = req.body;
  db.delete({
    model_name: MODEL_CINEMA,
    query: { _id },
    callback: rst => {
      res.send(rst);
    }
  });
});
// 查询影院
router.get("/cinemas", function(req, res) {
  let { currpage } = req.query;
  db.populate({
    model_name: MODEL_CINEMA,
    refs: ["city"],
    skip: (currpage - 1) * 5,
    limit: 5,
    callback: rst => {
      res.send(rst);
    }
  });
});
// 查询影院数量
router.get("/cinemacount", function(req, res) {
  db.count({
    model_name: MODEL_CINEMA,
    callback: rst => {
      res.send(rst);
    }
  });
});
router.get("/cinemabyid", function(req, res) {
  let { cinemaid } = req.query;
  db.findById({
    model_name: MODEL_CINEMA,
    id: cinemaid,
    callback: rst => {
      res.send(rst);
    }
  });
});
// 移动端根据cityid查询当前城市下的电影院信息
router.get("/cinemasbycityid", function(req, res) {
  let { cityid: city = "" } = req.query;
  db.find({
    model_name: MODEL_CINEMA,
    query: { city },
    callback: rst => {
      res.send(rst);
    }
  });
});
router.get("/cinemaspagebycityid", function(req, res) {
  let { cityid: city = "", page = 1, size = 10 } = req.query;
  page = Number.parseInt(page);
  size = Number.parseInt(size);
  db.pagination({
    model_name: MODEL_CINEMA,
    query: { city },
    skip: (page - 1) * size,
    limit: size,
    callback: rst => {
      res.send(rst);
    }
  });
});

// 影院对应的影片信息（影片信息是与影院关联的，每个影院放映的电影可能不同，多对多关联关系）
// 上传影片封面
router.post("/admin/movie/fileupload", (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    // 判断文件名如果为空，表示用户没有上传文件
    if (files.file.name == "") {
      // 新增没有选图，给默认图
      if (fields._id == "") {
        res.send({
          error_code: 0,
          reason: "成功",
          data: { url: "/images/51_270_360_2.jpg" }
        });
      } else {
        // 编辑没有选图，给上一次的图
        res.send({
          error_code: 0,
          reason: "成功",
          data: { url: fields.url }
        });
      }

      return;
    }
    // 有文件的情况；目标是要将文件从临时路径剪切到目标upload目录下
    /*
    1、判断public下是否存在upload文件夹，如果存在则不处理，反之mkdir建立文件夹
    2、给需要剪切的文件重命名；原因是用户上传的文件可能会重名
    3、使用fs.rename方法完成剪切操作
  */
    // 1、建立public文件夹
    let root_path = path.dirname(__dirname);
    console.log(root_path);
    let public_path = path.join(root_path, "public");
    let upload_path = path.join(public_path, "upload");
    if (!fs.existsSync(upload_path)) {
      fs.mkdirSync(upload_path, "0777");
    }

    // let ip = req.ip.toString().replace(/\./g, '');

    // 2、给文件重命名
    // 给文件找后缀
    let file_ext = ".jpg";
    switch (files.file.type) {
      case "image/jpeg":
      case "image/jpg":
        file_ext = ".jpg";
        break;
      case "image/png":
        file_ext = ".png";
        break;
      case "image/gif":
        file_ext = ".gif";
        break;
      default:
        break;
    }
    // 使用时间戳和随机数生成新名字
    let file_name =
      new Date().getTime() + Math.ceil(Math.random() * 100) + file_ext;

    // 3、剪切
    let target_path = path.join(upload_path, file_name);

    // 读文件流
    let readStream = fs.createReadStream(files.file.path);
    // 写文件流
    let writeStream = fs.createWriteStream(target_path);
    readStream.pipe(writeStream); //管道操作
    // 读失败的promise
    let readErr = new Promise((resolve, reject) => {
      readStream.on("error", err => {
        reject();
      });
    });
    // 写失败的promise
    let writeErr = new Promise((resolve, reject) => {
      writeStream.on("error", err => {
        reject();
      });
    });
    let successCpy = new Promise((resolve, reject) => {
      readStream.on("end", () => {
        resolve();
      });
    });
    // 任意一个失败就算失败
    Promise.race([readErr, writeErr, successCpy])
      .then(() => {
        fs.unlinkSync(files.file.path); //删除临时文件
        let url = path.join("/upload", file_name);
        res.send({
          error_code: 0,
          reason: "成功",
          data: { url }
        });
      })
      .catch(() => {
        res.send({
          error_code: 0,
          reason: "成功",
          data: { url: "/images/51_270_360_2.jpg" }
        });
      });
  });
});
// 新增影片信息
router.post("/admin/addmovie", function(req, res) {
  let { moviename, moviedes, moviecover, cinema } = req.body;
  db.insert({
    model_name: MODEL_MOVIE,
    data: { moviename, moviedes, moviecover, cinema },
    callback: rst => {
      console.log(rst);
      res.send(rst);
    }
  });
});
// 更新影片
router.post("/admin/updmovie", function(req, res) {
  let { _id, moviename, moviedes, moviecover, cinema } = req.body;
  db.update({
    model_name: MODEL_MOVIE,
    query: { _id },
    data: { moviename, moviedes, moviecover, cinema },
    callback: rst => {
      res.send(rst);
    }
  });
});
// 删除影片信息
router.post("/admin/delmovie", function(req, res) {
  let { _id } = req.body;
  db.delete({
    model_name: MODEL_MOVIE,
    query: { _id },
    callback: rst => {
      res.send(rst);
    }
  });
});
// 查询影片
router.get("/movie", function(req, res) {
  let { currpage } = req.query;
  db.populate({
    model_name: MODEL_MOVIE,
    refs: ["cinema"],
    skip: (currpage - 1) * 5,
    limit: 5,
    callback: rst => {
      res.send(rst);
    }
  });
});
// 查询影片数量
router.get("/moviecount", function(req, res) {
  db.count({
    model_name: MODEL_MOVIE,
    callback: rst => {
      res.send(rst);
    }
  });
});
router.get("/moviesbycinemaid", function(req, res) {
  let { cinema } = req.query;
  db.find({
    model_name: MODEL_MOVIE,
    query: { cinema },
    callback: rst => {
      res.send(rst);
    }
  });
});

// /*****************卖品类别操作******************/

// 新增卖品分类
router.post("/addsalertype", function(req, res) {
  let { salertype } = req.body;
  db.insert({
    model_name: MODEL_SALERTYPE,
    data: { salertype },
    callback: rst => {
      console.log(rst);
      res.send(rst);
    }
  });
});
// 修改卖品分类
router.post("/updsalertype", function(req, res) {
  let { _id, salertype } = req.body;
  db.update({
    model_name: MODEL_SALERTYPE,
    query: { _id },
    data: { salertype },
    callback: rst => {
      res.send(rst);
    }
  });
});
// 删除卖品分类
router.post("/delsalertype", function(req, res) {
  let { _id } = req.body;
  db.delete({
    model_name: MODEL_SALERTYPE,
    query: { _id },
    callback: rst => {
      res.send(rst);
    }
  });
});
// 查询卖品分类
router.get("/salertype", function(req, res) {
  let { currpage } = req.query;
  db.pagination({
    model_name: MODEL_SALERTYPE,
    skip: (currpage - 1) * 5,
    limit: 5,
    callback: rst => {
      res.send(rst);
    }
  });
});
router.get("/salertypelist", function(req, res) {
  db.find({
    model_name: MODEL_SALERTYPE,
    callback: rst => {
      res.send(rst);
    }
  });
});
// 查询卖品分类梳理
router.get("/salertypecount", function(req, res) {
  db.count({
    model_name: MODEL_SALERTYPE,
    callback: rst => {
      res.send(rst);
    }
  });
});

// /*****************卖品操作******************/

// 新增卖品
router.post("/addsaler", function(req, res) {
  let {
    salertitle,
    salerdes,
    salerrpice,
    salerimg,
    salertype,
    cinema
  } = req.body;
  db.insert({
    model_name: MODEL_SALER,
    data: { salertitle, salerdes, salerrpice, salerimg, salertype, cinema },
    callback: rst => {
      console.log(rst);
      res.send(rst);
    }
  });
});
// 修改卖品
router.post("/updsaler", function(req, res) {
  let {
    _id,
    salertitle,
    salerdes,
    salerrpice,
    salerimg,
    salertype,
    cinema
  } = req.body;
  db.update({
    model_name: MODEL_SALER,
    query: { _id },
    data: { salertitle, salerdes, salerrpice, salerimg, salertype, cinema },
    callback: rst => {
      res.send(rst);
    }
  });
});
// 删除卖品
router.post("/delsaler", function(req, res) {
  let { _id } = req.body;
  db.delete({
    model_name: MODEL_SALER,
    query: { _id },
    callback: rst => {
      res.send(rst);
    }
  });
});
// 查询卖品
router.get("/saler", function(req, res) {
  let { currpage, limit = 5 } = req.query;
  db.combinePopulate({
    model_name: MODEL_SALER,
    refs: ["salertype", "cinema"],
    skip: (currpage - 1) * 5,
    limit,
    callback: rst => {
      res.send(rst);
    }
  });
});
// 根据卖品所在影院查询卖品
router.get("/salerbycinema", function(req, res) {
  let { cinema } = req.query;
  db.combinePopulate({
    model_name: MODEL_SALER,
    refs: ["salertype", "cinema"],
    limit: 0,
    query: { cinema },
    callback: rst => {
      res.send(rst);
    }
  });
});
// 查询卖品
router.get("/salercount", function(req, res) {
  db.count({
    model_name: MODEL_SALER,
    callback: rst => {
      res.send(rst);
    }
  });
});

/*****************会员操作******************/

// 注册会员
router.post("/registermember", function(req, res) {
  let { mobile, password } = req.body;
  password = md5(password);

  db.insert({
    model_name: MODEL_MEMBER,
    data: { mobile, password },
    callback: rst => {
      res.send(rst);
    }
  });
});
// 修改会员
router.post("/updatemember", function(req, res) {
  let { _id, mobile, password } = req.body;
  password = md5(password);
  db.update({
    model_name: MODEL_MEMBER,
    query: { _id },
    data: { mobile, password },
    callback: rst => {
      res.send(rst);
    }
  });
});
// 删除会员
router.post("/deletemember", function(req, res) {
  let { _id } = req.body;
  db.delete({
    model_name: MODEL_MEMBER,
    query: { _id },
    callback: rst => {
      res.send(rst);
    }
  });
});
// 分页查询会员
router.get("/memberlist", function(req, res) {
  let { currpage, limit = 5 } = req.query;
  db.pagination({
    model_name: MODEL_MEMBER,
    skip: (currpage - 1) * 5,
    limit,
    callback: rst => {
      res.send(rst);
    }
  });
});
// 查询会员数量
router.get("/membercount", function(req, res) {
  db.count({
    model_name: MODEL_MEMBER,
    callback: rst => {
      res.send(rst);
    }
  });
});
// 会员列表查询
router.get("/getmember", function(req, res) {
  db.find({
    model_name: MODEL_MEMBER,
    callback: rst => {
      res.send(rst);
    }
  });
});
// 根据会员id查询会员信息
router.get("/admin/getmemberbyid", function(req, res) {
  let { _id } = req.query;
  db.findById({
    model_name: MODEL_MEMBER,
    query: { _id },
    callback: rst => {
      res.send(rst);
    }
  });
});

// 会员登录
router.post("/memberlogin", function(req, res) {
  let { mobile, password } = req.body;
  password = md5(password);
  db.count({
    model_name: MODEL_MEMBER,
    query: { mobile, password },
    callback: rst => {
      let { error_code, result } = rst;
      if (error_code == 0 && result == 1) {
        res.send({ error_code: 0, reason: "登陆成功", result: { mobile } });
      } else {
        res.send({ error_code: 101, reason: "登陆失败", result: { mobile } });
      }
    }
  });
});

module.exports = router;

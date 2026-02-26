// @ts-nocheck
var express = require("express");
var router = express.Router();
var path = require("path");
var fs = require("fs");
var formidable = require("formidable");
/* 七牛云图片上传 */
var qiniuUpload = require('../lib/qiniuModule.js');

/* 七牛云图片上传 */
router.post("/upload", qiniuUpload.picUpload);

/* 本地图片上传 */
/* tip: 文件上传时, 前端的content-type一定要是multipart/form-data */
router.post("/img_upload", (req, res) => {
  console.log("***进入文件上传***");
  var form = new formidable.IncomingForm();
  form.uploadDir = "./upload";
  form.keepExtensions = true;
  try {
    form.parse(req, function (err, fields, files) {
      const file = files.file;
      const tempPath = file.path;
      let originalName = file.name;
      if (originalName.indexOf("minpic") == -1) {
        let _tempName = originalName.split(".");
        originalName = _tempName[0] + "_" + Date.now() + "." + _tempName[1];
      }
      const targetPath = path.join(form.uploadDir, originalName);
      if (err) {
        console.log(err);
        res.json({ code: 0, msg: "上传失败！" });
      } else {
        var ip = req.headers["x-real-ip"] ? req.headers["x-real-ip"] : req.ip.replace(/::ffff:/, ""); // 有问题
        ip += ":" + (process.env.PORT || "8088");
        fs.rename(tempPath, targetPath, (err) => {
          if (err) {
            console.log(err);
            res.json({ code: 0, msg: "上传失败！" });
            return;
          } else {
            setTimeout(() => {
              res.json({
                code: 1,
                msg: "上传成功！",
                errno: 0,
                path: "/" + targetPath,
                data: ["/" + targetPath],
                imageUrl: "/" + targetPath,
              });
            }, 1000);
          }
        });
      }
    });
  } catch (error) {
    console.log("upload error ==>>>>", error);
  }
});

module.exports = router;

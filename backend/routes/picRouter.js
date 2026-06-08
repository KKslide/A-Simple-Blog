// @ts-nocheck
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const formidable = require("formidable");
/* 七牛云图片上传 */
const qiniuUpload = require('../lib/qiniuModule.js');

/* 七牛云图片上传 */
router.post("/upload", qiniuUpload.picUpload);

/* 本地图片上传 */
/* tip: 文件上传时, 前端的content-type一定要是multipart/form-data */
router.post("/img_upload", (req, res) => {
  console.log("***进入文件上传***");
  const form = new formidable.IncomingForm();
  form.uploadDir = "./upload";
  form.keepExtensions = true;

  form.parse(req, function (err, fields, files) {
    if (err) {
      console.log("form.parse error:", err);
      return res.status(500).json({ code: 0, msg: "上传失败！" });
    }

    // 校验文件是否存在
    if (!files || !files.file) {
      return res.status(400).json({ code: 0, msg: "未选择文件" });
    }

    const file = files.file;
    const tempPath = file.path;
    let originalName = file.name;

    if (originalName.indexOf("minpic") == -1) {
      let _tempName = originalName.split(".");
      originalName = _tempName[0] + "_" + Date.now() + "." + _tempName[1];
    }
    const targetPath = path.join(form.uploadDir, originalName);

    fs.rename(tempPath, targetPath, (renameErr) => {
      if (renameErr) {
        console.log("fs.rename error:", renameErr);
        return res.status(500).json({ code: 0, msg: "上传失败！" });
      }
      res.json({
        code: 1,
        msg: "上传成功！",
        errno: 0,
        path: "/" + targetPath,
        data: ["/" + targetPath],
        imageUrl: "/" + targetPath,
      });
    });
  });
});

module.exports = router;

// @ts-nocheck
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { formidable } = require("formidable");
const { success, fail } = require("../lib/response");
const authMiddleware = require("../middleware/auth.js");

/* 七牛云图片上传 */
const qiniuUpload = require('../lib/qiniuModule.js');

// 🔒 上传接口需要登录验证
router.use(authMiddleware);

/* 七牛云图片上传 */
router.post("/upload", qiniuUpload.picUpload);

/* 本地图片上传 */
/* tip: 文件上传时, 前端的content-type一定要是multipart/form-data */
router.post("/img_upload", async (req, res) => {
  console.log("***进入文件上传***");

  const uploadDir = path.join(__dirname, "../upload");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({
    uploadDir,
    keepExtensions: true,
  });

  try {
    const [fields, files] = await form.parse(req);

    // 校验文件是否存在
    const fileArr = files.file;
    if (!fileArr || !fileArr.length) {
      return fail(res, "未选择文件");
    }

    const file = fileArr[0];
    const tempPath = file.filepath;
    let originalName = file.originalFilename;

    if (originalName.indexOf("minpic") == -1) {
      const ext = path.extname(originalName);
      const base = path.basename(originalName, ext);
      originalName = base + "_" + Date.now() + ext;
    }
    const targetPath = path.join(uploadDir, originalName);

    fs.rename(tempPath, targetPath, (renameErr) => {
      if (renameErr) {
        console.log("fs.rename error:", renameErr);
        return fail(res, "上传失败！");
      }
      success(res, { msg: "上传成功！", data: { imageUrl: "/upload/" + originalName } });
    });
  } catch (err) {
    console.log("form.parse error:", err);
    return fail(res, "上传失败！");
  }
});

module.exports = router;

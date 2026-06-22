/**
 * 媒体上传路由
 *
 * POST /pic/upload    - 七牛云上传
 * POST /pic/img_upload - 本地上传
 *
 * 注意：路由前缀 /pic 在 app.js 中通过 app.use("/api", picRouter) 挂载
 *       完整路径为 /api/pic/upload 和 /api/pic/img_upload
 *
 * 安全：所有上传接口均需登录验证
 */

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

/**
 * POST /pic/upload
 * 七牛云图片上传
 * 请求体: multipart/form-data, 字段名 "file"
 * 响应: { status: '200', imageUrl: string }
 */
router.post("/pic/upload", qiniuUpload.picUpload);

/**
 * POST /pic/img_upload
 * 本地图片上传至 backend/upload 目录
 * 请求体: multipart/form-data, 字段名 "file"
 * 响应: { code: 1, msg: "上传成功", data: { imageUrl: string } }
 */
router.post("/pic/img_upload", async (req, res) => {
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

    // 如果文件名不包含 "minpic"，则添加时间戳避免重名
    if (originalName.indexOf("minpic") === -1) {
      const ext = path.extname(originalName);
      const base = path.basename(originalName, ext);
      originalName = base + "_" + Date.now() + ext;
    }
    const targetPath = path.join(uploadDir, originalName);

    fs.rename(tempPath, targetPath, (renameErr) => {
      if (renameErr) {
        return fail(res, "上传失败！");
      }
      success(res, { msg: "上传成功", data: { imageUrl: "/upload/" + originalName } });
    });
  } catch (err) {
    return fail(res, "上传失败！");
  }
});

module.exports = router;

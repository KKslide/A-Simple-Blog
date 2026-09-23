/**
 * 媒体上传路由
 *
 * POST /pic/upload     - 七牛云上传（后端中转，方案 A）
 * POST /pic/img_upload - 本地上传
 * POST /pic/token      - 签发七牛直传凭证（前端直传，仅签名不接触文件）
 *
 * 注意：路由前缀 /pic 在 app.js 中通过 app.use("/api", picRouter) 挂载
 *       完整路径为 /api/pic/upload、/api/pic/img_upload 和 /api/pic/token
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
/* 七牛云直传凭证签发 */
const { createUploadToken } = require('../lib/qiniuToken.js');

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
 * POST /pic/token
 * 签发七牛云直传凭证（前端直传）
 *
 * 请求体: { filename?: string }  —— 仅用于推导资源 key 的扩展名与可读前缀
 * 响应:   { code: 1, msg, data: { token, key, imageUrl, expires } }
 *
 * 前端拿到后在浏览器里直接把文件传到七牛，文件不经过本服务。
 * 凭证已被限定为「只能写入这一个 key」，有效期 1 小时，且不可覆盖。
 */
router.post("/pic/token", (req, res) => {
  const { filename } = req.body || {};
  const credential = createUploadToken(filename);

  if (!credential) {
    return fail(res, "七牛云凭证未配置，请联系管理员", 500);
  }
  return success(res, { msg: "签发成功", data: credential });
});

/**
 * POST /pic/img_upload
 * 本地图片上传至 backend/upload 目录
 * 请求体: multipart/form-data, 字段名 "file"
 * 响应: { code: 1, msg: "上传成功", data: { imageUrl: string } }
 */
// mark 可用nginx替换 → client_max_body_size 10m; (在 /api/pic location 中限制上传大小)
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

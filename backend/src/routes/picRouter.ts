/**
 * 媒体上传路由
 *
 * POST /pic/upload     - 七牛云上传（后端中转）
 * POST /pic/img_upload - 本地上传
 * POST /pic/token      - 签发七牛直传凭证（前端直传，仅签名不接触文件）
 *
 * 注意：路由前缀 /pic 在 app.ts 中通过 app.use("/api", picRouter) 挂载
 *       完整路径为 /api/pic/upload、/api/pic/img_upload 和 /api/pic/token
 *
 * 安全：所有上传接口均需登录验证
 */

import express from 'express'
import formidable from 'formidable'
import fs from 'node:fs'
import path from 'node:path'
import { success, fail } from '../lib/response.ts'
import authMiddleware from '../middleware/auth.ts'
import * as qiniuUpload from '../lib/qiniuModule.ts'
import { createUploadToken } from '../lib/qiniuToken.ts'
import { UPLOAD_DIR } from '../config/paths.ts'

const router = express.Router()

// 🔒 上传接口需要登录验证
router.use(authMiddleware)

/**
 * POST /pic/upload
 * 七牛云图片上传（后端中转：文件先到本站服务器，再转存七牛）
 */
router.post('/pic/upload', qiniuUpload.picUpload)

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
router.post('/pic/token', (req, res) => {
  const { filename } = req.body || {}
  const credential = createUploadToken(filename)

  if (!credential) {
    return fail(res, '七牛云凭证未配置，请联系管理员', 500)
  }
  return success(res, { msg: '签发成功', data: credential })
})

/**
 * POST /pic/img_upload
 * 本地图片上传至 backend/upload 目录
 * 请求体: multipart/form-data, 字段名 "file"
 * 响应: { code: 1, msg: "上传成功", data: { imageUrl: string } }
 */
// mark 可用nginx替换 → client_max_body_size 10m; (在 /api/pic location 中限制上传大小)
router.post('/pic/img_upload', async (req, res) => {
  const uploadDir = UPLOAD_DIR
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

  // FIXME: 开发环境没有 nginx 兜底，formidable 未设 maxFileSize，上传大小无限制，需补上（如 10MB）
  const form = formidable.formidable({
    uploadDir,
    keepExtensions: true,
  })

  try {
    const [_fields, files] = await form.parse(req)

    // 校验文件是否存在
    const fileArr = files.file
    if (!fileArr || !fileArr.length) {
      return fail(res, '未选择文件')
    }

    const file = fileArr[0]
    const tempPath = file.filepath
    const originalFilename = file.originalFilename
    if (!originalFilename) {
      return fail(res, '上传失败！')
    }
    let originalName = originalFilename

    // 如果文件名不包含 "minpic"，则添加时间戳避免重名
    if (originalName.indexOf('minpic') === -1) {
      const ext = path.extname(originalName)
      const base = path.basename(originalName, ext)
      originalName = base + '_' + Date.now() + ext
    }
    const targetPath = path.join(uploadDir, originalName)

    fs.rename(tempPath, targetPath, (renameErr) => {
      if (renameErr) {
        return fail(res, '上传失败！')
      }
      success(res, { msg: '上传成功', data: { imageUrl: '/upload/' + originalName } })
    })
  } catch {
    return fail(res, '上传失败！')
  }
})

export default router

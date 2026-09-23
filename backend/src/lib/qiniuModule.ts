/**
 * 七牛云图片上传（后端中转：文件先落到本站临时目录，再转存七牛，最后删除临时文件）
 *
 * 与 lib/qiniuToken.js（前端直传凭证签发）并存，二者互不影响。
 *
 * 修复记录（迁移时顺手修复）：
 *   - 原代码 respErr 分支缺 return，上传出错时会继续访问 respInfo.statusCode 导致 TypeError
 *   - 原代码 fs.unlinkSync 在临时文件已被清理时会抛异常，改为容错删除
 */
import fs from 'node:fs'
import path from 'node:path'
import formidable from 'formidable'
import qiniu from 'qiniu'
import type { Request, Response } from 'express'
import { UPLOAD_DIR } from '../config/paths.ts'
// 先加载 .env，保证模块加载时七牛密钥已就绪
import '../config/db.ts'

const bucket = process.env.QINIU_BUCKET || 'kkslide'
const imageUrl = process.env.QINIU_IMAGE_URL || 'http://example.kkslide.fun/'
const accessKey = process.env.QINIU_ACCESS_KEY
const secretKey = process.env.QINIU_SECRET_KEY
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)

const options = {
  scope: bucket,
  // FIXME: 永久有效凭证（≈2286 年）。当前仅在服务端内部使用不外发，但应改为短有效期并定期刷新
  expires: 9999999999,
}
const putPolicy = new qiniu.rs.PutPolicy(options)
const uploadToken = putPolicy.uploadToken(mac)

const config = new qiniu.conf.Config()
config.zone = qiniu.zone.Zone_z0 // 华东地区服务器

/** 容错删除临时文件（不存在时静默忽略） */
function safeUnlink(filePath: string) {
  fs.unlink(filePath, () => {
    /* 清理失败不影响上传结果 */
  })
}

/** 七牛云图片上传（后端中转） */
async function picUpload(req: Request, res: Response) {
  const form = formidable.formidable({
    uploadDir: UPLOAD_DIR,
    keepExtensions: true,
  })

  try {
    const [_fields, files] = await form.parse(req)
    // FIXME: 中转上传未设 maxFileSize，上传大小无限制，需补上（如 10MB）
    const fileArr = Object.values(files)[0] ?? []
    if (!fileArr.length) {
      res.end(JSON.stringify({ status: '-1', msg: '上传失败', error: '未选择文件' }))
      return
    }

    const file = fileArr[0]
    const localFile = file.filepath
    const key = path.basename(localFile)

    const formUploader = new qiniu.form_up.FormUploader(config)
    const putExtra = new qiniu.form_up.PutExtra()

    // 转存七牛（回调转 Promise）
    await new Promise<void>((resolve, reject) => {
      formUploader.putFile(uploadToken, key, localFile, putExtra, (respErr, respBody, respInfo) => {
        if (respErr) {
          res.end(JSON.stringify({ status: '-1', msg: '上传失败', error: String(respErr) }))
          reject(respErr)
          return
        }
        if (respInfo.statusCode == 200) {
          const imageSrc = imageUrl + respBody.key
          res.end(
            JSON.stringify({
              status: '200',
              errno: 0,
              msg: '上传成功',
              imageUrl: imageSrc,
              data: [imageSrc],
            }),
          )
          console.log(respBody)
          resolve()
        } else {
          res.end(
            JSON.stringify({ status: '-1', msg: '上传失败', error: JSON.stringify(respBody) }),
          )
          reject(new Error(`七牛返回 ${respInfo.statusCode}`))
        }
      })
    })

    // 上传之后删除本地临时文件
    safeUnlink(localFile)
  } catch (err) {
    if (!res.writableEnded) {
      res.end(JSON.stringify({ status: '-1', msg: '上传失败', error: String(err) }))
    }
  }
}

export { picUpload }

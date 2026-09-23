/**
 * 七牛云上传凭证签发（前端直传）
 *
 * 与 lib/qiniuModule.js（后端中转上传）并存，二者互不影响。
 * 本模块只负责签发一次性凭证，不接触任何文件内容。
 *
 * 安全约束：
 *   - scope 精确到单个 key，凭证无法用于写入其他资源
 *   - insertOnly=1 禁止覆盖已存在的同名文件
 *   - 短有效期（默认 1 小时）
 *   - 限制单文件大小与 MIME 类型
 *
 * 返回的 key 由服务端生成，前端无法指定，避免任意路径写入。
 */
import path from 'node:path'
import qiniu from 'qiniu'
// 先加载 .env，保证模块加载时七牛密钥已就绪
import '../config/db.ts'

const bucket = process.env.QINIU_BUCKET || 'kkslide'
const imageUrlPrefix = process.env.QINIU_IMAGE_URL || 'http://example.kkslide.fun/'
const accessKey = process.env.QINIU_ACCESS_KEY
const secretKey = process.env.QINIU_SECRET_KEY

/** 凭证有效期（秒） */
const TOKEN_EXPIRES = 3600
/** 单文件大小上限（字节） */
const MAX_FILE_SIZE = 10 * 1024 * 1024
/** 允许的图片扩展名 */
const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.bmp',
  '.svg',
  '.avif',
  '.tiff',
  '.tif',
]

let macInstance: qiniu.auth.digest.Mac | null = null

/** 惰性创建鉴权对象，密钥缺失时返回 null 而不是在模块加载期抛错 */
function getMac(): qiniu.auth.digest.Mac | null {
  if (!accessKey || !secretKey) return null
  if (!macInstance) macInstance = new qiniu.auth.digest.Mac(accessKey, secretKey)
  return macInstance
}

/**
 * 由原始文件名生成唯一的资源 key
 * 命名规则与本地后台上传保持一致：原名_时间戳.扩展名
 * 形如：cover_1758612345678.jpg / 我的封面_1758612345678.png
 * @param originalName 浏览器传来的原始文件名（仅用于取扩展名和可读前缀）
 */
function buildKey(originalName?: string): string {
  const safeName = typeof originalName === 'string' ? originalName : ''
  const rawExt = path.extname(safeName).toLowerCase()
  const ext = ALLOWED_EXTENSIONS.includes(rawExt) ? rawExt : '.jpg'

  const base =
    path
      .basename(safeName, path.extname(safeName))
      // 非安全字符统一替换为下划线，并合并连续下划线、去掉首尾下划线
      .replace(/[^\w.-]+/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^[_.-]+|[_.-]+$/g, '')
      .slice(0, 40) || 'img'

  return `${base}_${Date.now()}${ext}`
}

interface UploadCredential {
  token: string
  key: string
  imageUrl: string
  expires: number
}

/**
 * 签发一次性的上传凭证
 * @param originalName 原始文件名，用于推导 key 的扩展名与前缀
 * @returns 密钥未配置时返回 null
 */
function createUploadToken(originalName?: string): UploadCredential | null {
  const mac = getMac()
  if (!mac) return null

  const key = buildKey(originalName)
  const putPolicy = new qiniu.rs.PutPolicy({
    // 精确到具体 key：该凭证只能写入这一个资源
    scope: `${bucket}:${key}`,
    expires: TOKEN_EXPIRES,
    // 禁止覆盖同名文件
    insertOnly: 1,
    fsizeLimit: MAX_FILE_SIZE,
    mimeLimit: 'image/*',
  })

  return {
    token: putPolicy.uploadToken(mac),
    key,
    // key 由本模块生成，仅含 [\w.-]，无需额外 URL 编码
    imageUrl: imageUrlPrefix.replace(/\/?$/, '/') + key,
    expires: TOKEN_EXPIRES,
  }
}

export { createUploadToken, buildKey, TOKEN_EXPIRES, MAX_FILE_SIZE }

/**
 * 统一文件上传入口（前端直传七牛云）
 *
 * 流程：
 *   1. 向后端换取一次性上传凭证 —— 后端仅签名，不接触文件
 *   2. 用 qiniu-js 在浏览器内直接把文件传到七牛云
 *   3. 返回可直接使用的完整地址
 *
 * 文件本身不经过本站服务器，后端只参与第 1 步。
 *
 * 用法：
 *   const { url } = await uploadFile(file)
 *   const { url } = await uploadFile(file, { onProgress: p => console.log(p) })
 */

import { upload } from 'qiniu-js'
import ServerAPI from '@/api/server'
import utils from '@/utils'

export interface UploadResult {
  /** 可直接用于 <img src> 的完整地址 */
  url: string
  /** 七牛资源 key */
  key: string
}

export interface UploadOptions {
  /** 上传进度回调，percent 为 0-100 的整数 */
  onProgress?: (percent: number) => void
}

/** MIME 子类型 → 扩展名，处理几个不能直接当扩展名用的特例 */
const MIME_EXT_MAP: Record<string, string> = {
  jpeg: 'jpg',
  'svg+xml': 'svg',
  tiff: 'tif',
  'x-icon': 'ico',
}

/** 由 MIME 类型推导安全的扩展名，无法识别时回退 jpg */
function guessExtension(mimeType: string): string {
  const sub = (mimeType.split('/')[1] || '').toLowerCase()
  if (MIME_EXT_MAP[sub]) return MIME_EXT_MAP[sub]
  return /^[a-z0-9]+$/.test(sub) ? sub : 'jpg'
}

/**
 * qiniu-js 只接受 File（不接受裸 Blob），此处统一包装
 * 典型场景：Cropper 裁剪后返回的是 canvas 产生的 Blob
 */
function toFile(file: File | Blob): File {
  if (file instanceof File && file.name) return file
  const type = file.type || 'image/jpeg'
  return new File([file], `upload_${Date.now()}.${guessExtension(type)}`, { type })
}

/**
 * 上传单个文件到七牛云
 *
 * @param file - 待上传文件，Blob 会被自动包装为 File
 * @param options - 可选配置
 * @returns 上传成功后的完整地址与资源 key
 */
export function uploadFile(file: File | Blob, options: UploadOptions = {}): Promise<UploadResult> {
  const target = toFile(file)

  return ServerAPI.getUploadToken(target.name).then((res) => {
    const credential = res.data
    if (res.code !== 1 || !credential?.token || !credential?.key) {
      throw new Error(res.msg || '获取上传凭证失败')
    }

    return new Promise<UploadResult>((resolve, reject) => {
      upload(target, credential.key, credential.token, {}, { useCdnDomain: true }).subscribe({
        next: (progress) => {
          options.onProgress?.(Math.round(progress.total.percent))
        },
        error: (err) => {
          reject(new Error(err?.message || '上传失败'))
        },
        complete: () => {
          // key 由签发凭证时确定，无需等回调返回
          resolve({ url: utils.mediaUrl(credential.imageUrl), key: credential.key })
        },
      })
    })
  })
}

export default uploadFile

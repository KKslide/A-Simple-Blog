import os from 'node:os'
import type { Request } from 'express'

export function dateFormat(tplDate: string | number | Date): string {
  const date = new Date(tplDate as string | number | Date)
  const pad = (n: number) => (n >= 10 ? n : '0' + n)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function getNow(): string {
  return dateFormat(new Date())
}

/**
 * 从请求中读取客户端 IP (兼容反向代理自定义头)
 * mark 可用nginx简化 → proxy_set_header X-Real-IP $remote_addr;
 *   nginx 作为唯一反代时，可移除 x-wq-realip/connection.remoteAddress 等多余回退
 */
export function getClientIp(req: Request): string {
  try {
    const raw =
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.headers['x-wq-realip'] ||
      req.socket?.remoteAddress ||
      ''
    const first = String(raw).split(',')[0].trim()
    return normalizeClientIp(first)
  } catch {
    return ''
  }
}

/**
 * 规范化 IPv4 字符串, 去掉 ::ffff: 前缀
 */
export function normalizeClientIp(ip: unknown): string {
  if (!ip) return ''
  let value = String(ip).trim()
  if (value.startsWith('::ffff:')) value = value.slice(7)
  const match = value.match(
    /(25[0-5]|2[0-4]\d|[0-1]?\d{1,2})\.(25[0-5]|2[0-4]\d|[0-1]?\d{1,2})\.(25[0-5]|2[0-4]\d|[0-1]?\d{1,2})\.(25[0-5]|2[0-4]\d|[0-1]?\d{1,2})/,
  )
  return match ? match[0] : value
}

/**
 * 获取服务器本地 IP
 */
export function getServerIp(): string {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}

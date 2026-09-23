import bcrypt from 'bcrypt'
import { query, type Rows } from '../../db/index.ts'
import * as base from './baseRepository.ts'
import type { SafeUser, UserRow } from '../../types/entities.ts'

type UserSafeRow = UserRow

async function findByUsername(username: string): Promise<UserSafeRow | null> {
  const [rows] = await query<Rows<UserSafeRow>>(
    'SELECT id, username, password, is_admin FROM users WHERE username = ?',
    [username],
  )
  return rows[0] || null
}

/**
 * 校验用户名密码。前端发送 md5(password)。
 * - 旧版 MD5：直接比对，登录成功后自动升级为 bcrypt(md5)
 * - bcrypt：bcrypt.compare(md5, stored) 比对
 * @param username 用户名
 * @param password 前端已 MD5 过的密码
 */
async function authenticate(username: string, password: string): Promise<SafeUser | null> {
  const user = await findByUsername(username)
  if (!user) return null

  const stored = user.password
  let valid = false
  let needUpgrade = false

  if (typeof stored === 'string' && stored.startsWith('$2')) {
    // bcrypt(md5_password)
    valid = await bcrypt.compare(password, stored)
  } else {
    // 旧版 MD5，直接比对
    if (stored === password) {
      valid = true
      needUpgrade = true
    }
  }

  if (!valid) return null

  // 登录成功后自动将 MD5 升级为 bcrypt(md5)
  if (needUpgrade) {
    const newHash = await bcrypt.hash(password, 10)
    await base.updateById('users', user.id, { password: newHash })
  }

  const { password: _pwd, ...safe } = user
  return safe
}

/**
 * 生成 bcrypt 密码哈希
 * @param password 明文密码
 */
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

interface UpdateUserData {
  username?: string
  password?: string
}

/**
 * 更新用户信息（密码自动 bcrypt，接收前端 MD5 过的值）
 */
async function updateUser(id: number, data: UpdateUserData) {
  const payload: { username?: string; password?: string } = {}
  if (data.username) payload.username = data.username
  if (data.password) payload.password = await hashPassword(data.password)
  return base.updateById('users', id, payload)
}

export { findByUsername, authenticate, hashPassword, updateUser }

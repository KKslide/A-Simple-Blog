const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { query } = require("../../db/index");
const base = require("./baseRepository");

async function findByUsername(username) {
  const [rows] = await query(
    "SELECT id, username, password, is_admin FROM users WHERE username = ?",
    [username]
  );
  return rows[0] || null;
}

/**
 * 校验用户名密码。支持 bcrypt 和旧版 MD5（登录成功后自动升级为 bcrypt）。
 * @param {string} username
 * @param {string} password
 */
async function authenticate(username, password) {
  const user = await findByUsername(username);
  if (!user) return null;

  const stored = user.password;
  let valid = false;
  let needUpgrade = false;

  if (typeof stored === "string" && stored.startsWith("$2")) {
    // bcrypt 哈希
    valid = await bcrypt.compare(password, stored);
  } else {
    // 旧版 MD5，验证后自动升级为 bcrypt
    const md5 = crypto.createHash("md5").update(password).digest("hex");
    if (stored === md5) {
      valid = true;
      needUpgrade = true;
    }
  }

  if (!valid) return null;

  // 登录成功后自动将 MD5 升级为 bcrypt
  if (needUpgrade) {
    const newHash = await bcrypt.hash(password, 10);
    await base.updateById("users", user.id, { password: newHash });
  }

  const { password: _pwd, ...safe } = user;
  return safe;
}

/**
 * 生成 bcrypt 密码哈希
 * @param {string} password 明文密码
 */
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

/**
 * 更新用户信息（密码会自动哈希）
 * @param {number} id
 * @param {{ username?: string; password?: string }} data
 */
async function updateUser(id, data) {
  /** @type {Record<string, unknown>} */
  const payload = {};
  if (data.username) payload.username = data.username;
  if (data.password) payload.password = await hashPassword(data.password);
  return base.updateById("users", id, payload);
}

module.exports = { findByUsername, authenticate, hashPassword, updateUser };

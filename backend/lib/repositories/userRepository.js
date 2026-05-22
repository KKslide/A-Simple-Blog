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
 * 校验用户名密码。支持 bcrypt、旧版 MD5、明文。
 * @param {string} username
 * @param {string} password
 */
async function authenticate(username, password) {
  const user = await findByUsername(username);
  if (!user) return null;

  const stored = user.password;
  let valid = false;

  if (typeof stored === "string" && stored.startsWith("$2")) {
    valid = await bcrypt.compare(password, stored);
  } else {
    const md5 = crypto.createHash("md5").update(password).digest("hex");
    valid = stored === password || stored === md5;
  }

  if (!valid) return null;

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

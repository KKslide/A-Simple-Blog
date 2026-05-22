#!/usr/bin/env node
/**
 * 将管理员密码哈希后写入 users 表。
 * 用法：node scripts/hash-password.js [用户名] [明文密码]
 * 示例：node scripts/hash-password.js admin 123456
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const bcrypt = require("bcrypt");
const { pool } = require("../db/index");

const username = process.argv[2] || "admin";
const plain = process.argv[3] || "123456";

async function main() {
  const hash = await bcrypt.hash(plain, 10);
  const [result] = await pool.query("UPDATE users SET password = ? WHERE username = ?", [
    hash,
    username,
  ]);
  console.log(`已更新用户 "${username}" 共 ${result.affectedRows} 条记录。`);
  console.log("bcrypt 哈希值:", hash);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

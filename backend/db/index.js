const mysql = require("mysql2/promise");
const dbConfig = require("../config/db");

const pool = mysql.createPool(dbConfig);

pool
  .getConnection()
  .then((conn) => {
    console.log("数据库连上啦- -。");
    conn.release();
  })
  .catch((err) => {
    console.error("数据库连接失败:", err.message);
  });

/**
 * 执行参数化 SQL
 * @param {string} sql SQL 语句
 * @param {unknown[]} [params] 占位符参数
 * @returns {Promise<[import('mysql2').RowDataPacket[], import('mysql2').FieldPacket[]]>}
 */
async function query(sql, params = []) {
  return pool.query(sql, params);
}

/** 优雅关闭连接池 */
async function closePool() {
  await pool.end();
  console.log("数据库连接池已关闭");
}

module.exports = { pool, query, closePool };

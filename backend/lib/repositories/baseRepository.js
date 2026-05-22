const { query } = require("../../db/index");

/** 表名白名单 */
const TABLES = {
  category: "category",
  article: "article",
  comment: "comment",
  messages: "messages",
  users: "users",
  visitors: "visitors",
};

/** 各表允许读写的字段白名单 */
const COLUMNS = {
  category: new Set(["name", "banner_url", "sort_order", "show_type", "is_del"]),
  article: new Set([
    "title",
    "category_id",
    "content",
    "description",
    "cover_url",
    "video_url",
    "view_count",
    "is_published",
    "is_pinned",
    "is_del",
  ]),
  comment: new Set(["article_id", "nickname", "content", "ip", "is_del"]),
  messages: new Set(["nickname", "content", "ip", "is_del"]),
  users: new Set(["username", "password", "is_admin"]),
  visitors: new Set(["ip", "visited_at"]),
};

function resolveTable(tableKey) {
  const table = TABLES[tableKey];
  if (!table) throw new Error(`无效的表名: ${tableKey}`);
  return table;
}

function pickColumns(tableKey, data) {
  const allowed = COLUMNS[tableKey];
  if (!allowed) throw new Error(`未配置字段白名单: ${tableKey}`);
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const [key, value] of Object.entries(data)) {
    if (allowed.has(key) && value !== undefined) out[key] = value;
  }
  return out;
}

/** 转为正整数，无效时返回 fallback */
function toPositiveInt(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

/**
 * 查询未软删除的全部记录
 * @param {string} tableKey 表键（见 TABLES）
 */
async function findAllActive(tableKey) {
  const table = resolveTable(tableKey);
  const [rows] = await query(`SELECT * FROM \`${table}\` WHERE is_del = '0'`);
  return rows;
}

/**
 * 分页查询未软删除记录
 * @param {string} tableKey
 * @param {{ pageNo?: number; pageSize?: number; orderColumn?: string }} opts
 */
async function findPageActive(tableKey, { pageNo = 1, pageSize = 10, orderColumn } = {}) {
  const table = resolveTable(tableKey);
  const pNo = toPositiveInt(pageNo, 1);
  const pSize = toPositiveInt(pageSize, 10);
  const offset = (pNo - 1) * pSize;
  const order =
    orderColumn && COLUMNS[tableKey]?.has(orderColumn)
      ? `ORDER BY \`${orderColumn}\` DESC`
      : "";
  const [rows] = await query(
    `SELECT * FROM \`${table}\` WHERE is_del = '0' ${order} LIMIT ? OFFSET ?`,
    [pSize, offset]
  );
  return rows;
}

/**
 * 插入一条记录
 * @param {string} tableKey
 * @param {Record<string, unknown>} data
 */
async function insert(tableKey, data) {
  const table = resolveTable(tableKey);
  const row = pickColumns(tableKey, data);
  const keys = Object.keys(row);
  if (!keys.length) throw new Error("没有可插入的有效字段");
  const placeholders = keys.map(() => "?").join(", ");
  const sql = `INSERT INTO \`${table}\` (${keys.map((k) => `\`${k}\``).join(", ")}) VALUES (${placeholders})`;
  const [result] = await query(sql, Object.values(row));
  return result;
}

/**
 * 按 id 更新
 * @param {string} tableKey
 * @param {number|string} id
 * @param {Record<string, unknown>} data
 */
async function updateById(tableKey, id, data) {
  const table = resolveTable(tableKey);
  const numericId = toPositiveInt(id, 0);
  if (!numericId) throw new Error("无效的 id");
  const row = pickColumns(tableKey, data);
  const keys = Object.keys(row);
  if (!keys.length) throw new Error("没有可更新的有效字段");
  const setStr = keys.map((k) => `\`${k}\` = ?`).join(", ");
  const sql = `UPDATE \`${table}\` SET ${setStr} WHERE id = ?`;
  const [result] = await query(sql, [...Object.values(row), numericId]);
  return result;
}

/**
 * 软删除（is_del = 1）
 * @param {string} tableKey
 * @param {number|string} id
 */
async function softDelete(tableKey, id) {
  const table = resolveTable(tableKey);
  const numericId = toPositiveInt(id, 0);
  if (!numericId) throw new Error("无效的 id");
  const [result] = await query(`UPDATE \`${table}\` SET is_del = '1' WHERE id = ?`, [numericId]);
  return result;
}

module.exports = {
  TABLES,
  findAllActive,
  findPageActive,
  insert,
  updateById,
  softDelete,
  toPositiveInt,
};

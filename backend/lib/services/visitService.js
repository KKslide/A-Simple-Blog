/** 全站访问统计: 写入 visitors 表, 仪表盘按 PV/UV 聚合 */
const { query } = require("../../db/index");
const base = require("../repositories/baseRepository");
const util = require("../../util/util");

/**
 * 记录一次全站访问 (PV +1)
 * @param {import('express').Request} req
 * @returns {Promise<{ recorded: boolean, ip: string }>}
 */
async function recordSiteVisit(req) {
  const ip = util.getClientIp(req);
  await base.insert("visitors", {
    ip: ip || null,
    visited_at: util.getNow(),
  });
  return { recorded: true, ip };
}

/**
 * 近 24 小时按小时 PV
 */
async function getHourlyPvLast24h() {
  const [rows] = await query(
    `SELECT HOUR(visited_at) AS hour, COUNT(*) AS count
     FROM visitors
     WHERE visited_at >= NOW() - INTERVAL 24 HOUR
     GROUP BY hour`
  );
  return rows;
}

/**
 * 仪表盘全站 PV/UV 汇总
 */
async function getSiteVisitStats() {
  const [rows] = await query(
    `SELECT
       (SELECT COUNT(*) FROM visitors) AS pvTotal,
       (SELECT COUNT(*) FROM visitors WHERE DATE(visited_at) = CURDATE()) AS pvToday,
       (SELECT COUNT(DISTINCT ip) FROM visitors WHERE ip IS NOT NULL AND ip != '') AS uvTotal,
       (SELECT COUNT(DISTINCT ip) FROM visitors
         WHERE ip IS NOT NULL AND ip != '' AND DATE(visited_at) = CURDATE()) AS uvToday`
  );
  return rows[0] || { pvTotal: 0, pvToday: 0, uvTotal: 0, uvToday: 0 };
}

module.exports = {
  recordSiteVisit,
  getHourlyPvLast24h,
  getSiteVisitStats,
};

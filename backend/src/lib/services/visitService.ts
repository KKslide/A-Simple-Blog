/** 全站访问统计: 写入 visitors 表, 仪表盘按 PV/UV 聚合 */
import type { Request } from 'express'
import { query, type Rows } from '../../db/index.ts'
import * as base from '../repositories/baseRepository.ts'
import * as util from '../../util/util.ts'
import type { SiteVisitStats, DashboardTimelineRow } from '../../types/entities.ts'

/**
 * 记录一次全站访问 (PV +1)
 */
async function recordSiteVisit(req: Request): Promise<{ recorded: boolean; ip: string }> {
  const ip = util.getClientIp(req)
  await base.insert('visitors', {
    ip: ip || null,
    visited_at: util.getNow(),
  })
  return { recorded: true, ip }
}

/**
 * 近 24 小时按小时 PV
 */
async function getHourlyPvLast24h(): Promise<DashboardTimelineRow[]> {
  const [rows] = await query<Rows<DashboardTimelineRow>>(
    `SELECT HOUR(visited_at) AS hour, COUNT(*) AS count
     FROM visitors
     WHERE visited_at >= NOW() - INTERVAL 24 HOUR
     GROUP BY hour`,
  )
  return rows
}

/**
 * 仪表盘全站 PV/UV 汇总
 */
async function getSiteVisitStats(): Promise<SiteVisitStats> {
  const [rows] = await query<Rows<SiteVisitStats>>(
    `SELECT
       (SELECT COUNT(*) FROM visitors) AS pvTotal,
       (SELECT COUNT(*) FROM visitors WHERE DATE(visited_at) = CURDATE()) AS pvToday,
       (SELECT COUNT(DISTINCT ip) FROM visitors WHERE ip IS NOT NULL AND ip != '') AS uvTotal,
       (SELECT COUNT(DISTINCT ip) FROM visitors
         WHERE ip IS NOT NULL AND ip != '' AND DATE(visited_at) = CURDATE()) AS uvToday`,
  )
  return rows[0] || { pvTotal: 0, pvToday: 0, uvTotal: 0, uvToday: 0 }
}

export { recordSiteVisit, getHourlyPvLast24h, getSiteVisitStats }

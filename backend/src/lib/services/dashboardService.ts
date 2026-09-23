/**
 * 管理端仪表盘统计数据
 * 注意: 饼图数据从 category 表动态查询, 过滤软删除分类
 * ⚠️ "Other" 是系统兜底分类, 绝对不能删除 (见 adminHandler.delCategory)
 */
import { query, type Rows } from '../../db/index.ts'
import * as visitService from './visitService.ts'
import type { DashboardPieRow, DashboardStatsRow } from '../../types/entities.ts'

interface DashboardTagItem {
  tag: string
  value: number
}

interface DashboardLineItem {
  time: string
  value: number
}

interface DashboardData {
  tag_list: DashboardTagItem[]
  pie_chart_data: DashboardPieRow[]
  line_chart_data: DashboardLineItem[]
}

async function getDashboardData(): Promise<DashboardData> {
  const statsSql = `SELECT (SELECT COUNT(*) FROM users) AS userNum, COUNT(a.id) AS articleNum FROM article a`

  const pieSql = `
    SELECT c.name, COUNT(a.id) AS value
    FROM category c
    LEFT JOIN article a ON a.category_id = c.id
    WHERE c.is_del = '0'
    GROUP BY c.id, c.name
    ORDER BY c.id
  `

  const [statsResult, pieResult, siteVisit, timelineRows] = await Promise.all([
    query<Rows<DashboardStatsRow>>(statsSql),
    query<Rows<DashboardPieRow>>(pieSql),
    visitService.getSiteVisitStats(),
    visitService.getHourlyPvLast24h(),
  ])

  const stats = statsResult[0][0]
  const pieRows = pieResult[0]
  const resData: DashboardData = {
    tag_list: [
      { tag: '总浏览量(PV)', value: siteVisit.pvTotal },
      { tag: '今日浏览(PV)', value: siteVisit.pvToday },
      { tag: '今日访客(UV)', value: siteVisit.uvToday },
      { tag: '用户', value: stats.userNum },
      { tag: '文章数', value: stats.articleNum },
    ],
    pie_chart_data: pieRows.map((r) => ({ name: r.name, value: Number(r.value) })),
    line_chart_data: [],
  }

  const lineChartDataMap = new Map<number, DashboardLineItem>()
  const currentHour = new Date().getHours()
  for (let i = 0; i < 24; i++) {
    const hour = (currentHour - i + 24) % 24
    const formattedHour = hour < 10 ? '0' + hour : hour.toString()
    lineChartDataMap.set(hour, { time: formattedHour, value: 0 })
  }

  for (const row of timelineRows) {
    const item = lineChartDataMap.get(row.hour)
    if (item) {
      item.value = row.count
    }
  }

  resData.line_chart_data = Array.from(lineChartDataMap.values()).reverse()
  return resData
}

export { getDashboardData }

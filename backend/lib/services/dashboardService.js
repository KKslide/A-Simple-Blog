/**
 * 管理端仪表盘统计数据
 * 注意: 饼图数据从 category 表动态查询, 过滤软删除分类
 * ⚠️ "Other" 是系统兜底分类, 绝对不能删除 (见 adminHandler.delCategory)
 */
const { query } = require("../../db/index");
const visitService = require("./visitService");

async function getDashboardData() {
  const statsSql = `SELECT (SELECT COUNT(*) FROM users) AS userNum, COUNT(a.id) AS arcticleNum FROM article a`;

  const pieSql = `
    SELECT c.name, COUNT(a.id) AS value
    FROM category c
    LEFT JOIN article a ON a.category_id = c.id
    WHERE c.is_del = '0'
    GROUP BY c.id, c.name
    ORDER BY c.id
  `;

  const [statsResult, pieResult, siteVisit, timelineRows] = await Promise.all([
    query(statsSql),
    query(pieSql),
    visitService.getSiteVisitStats(),
    visitService.getHourlyPvLast24h(),
  ]);

  const stats = statsResult[0][0];
  const pieRows = pieResult[0];
  const resData = {
    tag_list: [
      { tag: "总浏览量(PV)", value: siteVisit.pvTotal },
      { tag: "今日浏览(PV)", value: siteVisit.pvToday },
      { tag: "今日访客(UV)", value: siteVisit.uvToday },
      { tag: "用户", value: stats.userNum },
      { tag: "文章数", value: stats.arcticleNum },
    ],
    pie_chart_data: pieRows.map((r) => ({ name: r.name, value: Number(r.value) })),
  };

  const lineChartDataMap = new Map();
  const currentHour = new Date().getHours();
  for (let i = 0; i < 24; i++) {
    const hour = (currentHour - i + 24) % 24;
    const formattedHour = hour < 10 ? "0" + hour : hour.toString();
    lineChartDataMap.set(hour, { time: formattedHour, value: 0 });
  }

  for (const row of timelineRows) {
    if (lineChartDataMap.has(row.hour)) {
      lineChartDataMap.get(row.hour).value = row.count;
    }
  }

  resData.line_chart_data = Array.from(lineChartDataMap.values()).reverse();
  return resData;
}

module.exports = { getDashboardData };

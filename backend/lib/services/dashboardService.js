/** 管理端仪表盘统计数据 */
const { query } = require("../../db/index");
const visitService = require("./visitService");

async function getDashboardData() {
  const statsSql = `
    SELECT
      (SELECT COUNT(*) FROM users) AS userNum,
      COUNT(a.id) AS arcticleNum,
      COUNT(CASE WHEN c.name = 'Fun' THEN 1 ELSE NULL END) AS Fun,
      COUNT(CASE WHEN c.name = 'Blog' THEN 1 ELSE NULL END) AS Blog,
      COUNT(CASE WHEN c.name = 'Vlog' THEN 1 ELSE NULL END) AS Vlog,
      COUNT(CASE WHEN c.name = 'Code' THEN 1 ELSE NULL END) AS Code,
      COUNT(CASE WHEN c.name = 'Other' THEN 1 ELSE NULL END) AS Other
    FROM article a
    LEFT JOIN category c ON a.category_id = c.id
  `;

  const [statsResult, siteVisit, timelineRows] = await Promise.all([
    query(statsSql),
    visitService.getSiteVisitStats(),
    visitService.getHourlyPvLast24h(),
  ]);

  const stats = statsResult[0][0];
  const resData = {
    tag_list: [
      { tag: "总浏览量(PV)", value: siteVisit.pvTotal },
      { tag: "今日浏览(PV)", value: siteVisit.pvToday },
      { tag: "今日访客(UV)", value: siteVisit.uvToday },
      { tag: "用户", value: stats.userNum },
      { tag: "文章数", value: stats.arcticleNum },
    ],
    pie_chart_data: [
      { name: "Fun", value: stats.Fun },
      { name: "Blog", value: stats.Blog },
      { name: "Vlog", value: stats.Vlog },
      { name: "Code", value: stats.Code },
      { name: "Other", value: stats.Other },
    ],
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

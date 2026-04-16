// @ts-nocheck
const connection = require("../db/index"); // 数据库连接配置
const utils = require("../util/util");

/**
 * CRUD
 */
/* 查询 */
module.exports.doQuery = (options, callback) => {
  let table = options.table; // 要查询的表格
  let pageNo = options.pageNo; // 页码
  let pageSize = options.pageSize; // 页容量
  let searchType = options.type; // 条件- 是否全量查询
  let order = options.order; // 按照什么字段排序
  let sql = ``;
  switch (searchType) {
    case "all": // 0- 普通全量查询(多用于前端)
      sql += `SELECT * FROM ${table} where is_del='0'`;
      break;
    case "articles": // 1- 文章管理端的查询
      sql += `
          select 
          (select count(*) from article) total,
          count(cm.a_id) comment_num,
          cate.name as cate_name,
          a.* 
          from article a 
          left join category cate on a.category = cate.id
          left join comment cm on a.id=cm.a_id 
          and cm.is_del='0'
          where a.is_del='0'
          group by a.id 
          order by a.add_time desc 
          limit ${(pageNo - 1) * pageSize},${pageSize}`;
      break;
    default: // 2- 常规查询
      sql += `
        SELECT * FROM ${table} 
        where is_del='0' 
        ${order? 'order by ' + order + ' desc' : ''}
        limit ${(pageNo - 1) * pageSize},${pageSize}
      `;
      break;
  }
  connection.query(sql, (err, data) => {
    if (err) {
      console.log(err);
      callback(null, err);
    } else {
      callback(null, data);
    }
  });
};
/* 新增 */
module.exports.doAdd = (options, callback) => {
  let table = options.table;
  let keys = Object.keys(options.data);
  let values = Object.values(options.data);
  let placeholders = keys.map(() => "?").join(", ");
  let sql = `insert into ${table} (${keys.join(", ")}) values (${placeholders}) `;
  connection.query(sql, values, (err, res) => {
    if (res.affectedRows == 1) {
      callback();
    } else {
      callback(err);
    }
  });
};
/* 删除 */
module.exports.doDel = (options, callback) => {
  let id = options.id;
  let table = options.table;
  let sql = `update ${table} set is_del='1' where ${table == "comment" ? "t_id" : "id"} = ${id}`;
  connection.query(sql, (err, res) => {
    if (res.affectedRows == 1) {
      callback();
    } else {
      callback(err);
    }
  });
};
/* 修改 */
module.exports.doEdit = (options, callback) => {
  const table = options.table;
  const id = options.id;
  const data = options.data;

  const keys = Object.keys(data); // ['title', 'content', ...]
  const values = Object.values(data); // ['xxx', 'yyy', ...]
  const setStr = keys.map((key) => `${key} = ?`).join(", "); // title = ?, content = ? ...

  const sql = `UPDATE ${table} SET ${setStr} WHERE id = ?`;
  values.push(id); // 添加到 values 末尾，匹配 WHERE id = ?

  connection.query(sql, values, (err, res) => {
    if (err) {
      console.error(err);
      return callback(err);
    }
    if (res.affectedRows === 1) {
      callback(null, res); // 可返回更新结果
    } else {
      callback(new Error("Update failed"));
    }
  });
};
/* 登陆查询 */
module.exports.loginQuery = async (options, callback) => {
  const sql = `SELECT id, username, isadmin FROM users WHERE username = ? AND password = ?`;
  const values = [options.username, options.password];
  try {
    const data = await connection.queryAsync(sql, values);
    callback(null, data);
  } catch (err) {
    console.error("err ==>>>", err);
    console.log(err);
  }
};

/**
 * 后台管理页一些复杂查询↓
 */
/* 管理页首页数据 */
module.exports.getDashboardData = async function (callback) {
  try {
    // --- tags ---
    const statsSql = `
      SELECT
          (SELECT COUNT(*) FROM visitors) AS visitTotal,
          (SELECT COUNT(*) FROM visitors WHERE DATE(time) = CURDATE()) AS visitToday,
          (SELECT COUNT(*) FROM users) AS userNum,
          COUNT(a.id) AS arcticleNum,
          COUNT(CASE WHEN c.name = 'Fun' THEN 1 ELSE NULL END) AS Fun,
          COUNT(CASE WHEN c.name = 'Blog' THEN 1 ELSE NULL END) AS Blog,
          COUNT(CASE WHEN c.name = 'Vlog' THEN 1 ELSE NULL END) AS Vlog,
          COUNT(CASE WHEN c.name = 'Code' THEN 1 ELSE NULL END) AS Code,
          COUNT(CASE WHEN c.name = 'Other' THEN 1 ELSE NULL END) AS Other
      FROM 
          article a
      LEFT JOIN 
          category c ON a.category = c.id;
    `;
    // --- 24小时访问量 ---
    const timelineSql = `
      SELECT 
          HOUR(time) AS hour, 
          COUNT(*) AS count 
      FROM 
          visitors 
      WHERE 
          time >= NOW() - INTERVAL 24 HOUR 
      GROUP BY 
          hour;
    `;

    // --- 并行执行两个查询 ---
    const [statsResult, timelineResult] = await Promise.all([connection.queryAsync(statsSql), connection.queryAsync(timelineSql)]);

    // --- 处理第一个查询的结果 ---
    const stats = statsResult[0];
    const resData = {
      tag_list: [
        { tag: "总访问量", value: stats.visitTotal },
        { tag: "今日访问量", value: stats.visitToday },
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

    // --- 处理第二个查询的结果 (折线图数据) ---

    // 1. 创建一个包含过去24小时所有小时的模板，默认值为0
    const lineChartDataMap = new Map();
    const currentHour = new Date().getHours();
    for (let i = 0; i < 24; i++) {
      const hour = (currentHour - i + 24) % 24; // 计算过去的小时，例如当前10点，1小时前是9点，11小时前是23点
      const formattedHour = hour < 10 ? "0" + hour : hour.toString();
      lineChartDataMap.set(hour, { time: formattedHour, value: 0 });
    }

    // 2. 用从数据库查出的真实数据填充模板
    for (const row of timelineResult) {
      if (lineChartDataMap.has(row.hour)) {
        lineChartDataMap.get(row.hour).value = row.count;
      }
    }

    // 3. 将 Map 转换为数组并按时间倒序
    resData.line_chart_data = Array.from(lineChartDataMap.values()).reverse();

    // --- 通过回调返回最终结果 ---
    callback(resData);
  } catch (err) {
    console.error("Failed to get dashboard data:", err);
    callback(err, null);
  }
};
/* 文章评论管理查询 */
module.exports.queryCommentList = function (options, callback) {
  let id = options.id;
  let sql = ` select * from comment where a_id=${id} and is_del='0' `;
  connection.query(sql, (err, data) => {
    if (err) {
      console.log(err);
      callback(null, err);
    } else {
      callback(null, data);
    }
  });
};
/* 留言管理- 留言数量总数 */
module.exports.queryMessageList = async (options, callback) => {
  const countSQL = `select count(*) as 'count' from messages where is_del='0';`;
  const countRes = await connection.queryAsync(countSQL);
  const { count } = countRes[0]
  this.doQuery(options, (err, data) => {
    callback({
      messages: data,
      pages: Math.ceil(count / options.pageSize), // 页数长度
      total: count,
    })
  })
};

/* ***************************************************** */
/**
 * 前端页面
 */
module.exports.getIndexPageData = async function (options, callback) {
  try {
    const categoryQuery = "SELECT id, name, show_type FROM category WHERE is_del = '0' ORDER BY rank_index desc;";
    // todo: 考虑是否删除掉 composition 和 其他多余字段的返回
    const articleQuery = `
      WITH RankedArticles AS (
          SELECT
              a.id, a.title, cat.name AS category, a.description, a.add_time,
              a.view_num, a.minpic_url, a.is_top, cat.rank_index, -- a.composition, a.video_src, a.is_show, a.is_del,
              ROW_NUMBER() OVER(PARTITION BY a.category ORDER BY a.add_time DESC) AS rn
          FROM article a
          INNER JOIN category cat ON a.category = cat.id
          WHERE a.is_del = '0' AND a.is_show = '1' AND cat.is_del = '0'
      )
      SELECT
          ra.*, IFNULL(c.comment_num, 0) AS comment_num
      FROM RankedArticles ra
      LEFT JOIN
          (SELECT a_id, COUNT(*) AS comment_num FROM comment WHERE is_del = '0' GROUP BY a_id) c 
      ON ra.id = c.a_id
      -- WHERE ra.rn <= 3
      ORDER BY ra.rank_index, ra.add_time DESC;
    `;

    const catList = await connection.queryAsync(categoryQuery);
    const articleList = await connection.queryAsync(articleQuery);
    // 初始化 blogList 对象，将所有分类名作为key，value为空数组
    // 这样可以确保即使某个分类下没有文章，前端也能收到该分类的空数组
    const blogList = {'TOP':[]};
    catList.forEach((cat) => {
      blogList[cat.name] = [];
    });

    // 遍历查询到的文章列表，填充到 blogList 对象中
    articleList.forEach((article) => {
      // 从结果中删除不再需要的排名列 `rn`
      delete article.rn;

      // 因为SQL返回的结果中已经包含了category名称，可以直接使用
      if (blogList[article.category]&&article.is_top=='0') {
        blogList[article.category].push(article);
      }
      // 把置顶文章填入单独key中
      if (article.is_top == '1') {
        blogList['TOP'].push(article)
      }
    });

    // 构造最终返回给前端的数据结构
    const responseData = {
      catList,
      blogList,
    };
    callback(responseData);
  } catch (error) {
    console.error("获取首页数据时出错:", error);
    callback({
      code: 500,
      message: "服务器内部错误",
    });
  }
};

/* 文章查询 */
module.exports.doSearch = async function (options, callback) {
  try {
    let { keyword, starttime, endtime, category_id, pageNo, pageSize } = options.body;

    // 处理参数
    keyword = keyword && keyword.trim() !== "" ? keyword.trim() : null;
    category_id = category_id && !isNaN(category_id) ? Number(category_id) : null;
    starttime = starttime && starttime.trim() !== "" ? starttime.trim() : null;
    endtime = endtime && endtime.trim() !== "" ? endtime.trim() : null;

    // 分页参数
    pageNo = pageNo && !isNaN(pageNo) ? Number(pageNo) : null;
    pageSize = pageSize && !isNaN(pageSize) ? Number(pageSize) : null;

    // 基础 SQL（不加 limit）
    let sql = `
      SELECT 
        (SELECT COUNT(*) 
         FROM article a2
         LEFT JOIN category c2 ON a2.category = c2.id
         WHERE a2.is_del='0'
           AND c2.is_del='0'
           ${category_id !== null ? " AND a2.category = ?" : ""}
           ${keyword !== null ? ` AND (a2.title LIKE ? OR a2.description LIKE ?)` : ""}
           ${starttime !== null ? " AND a2.add_time >= ?" : ""}
           ${endtime !== null ? " AND a2.add_time <= ?" : ""}
        ) AS total,
        COUNT(cm.a_id) AS comment_num,
        cate.name AS cate_name,
        a.* 
      FROM article a
      LEFT JOIN category cate ON a.category = cate.id
      LEFT JOIN comment cm ON a.id = cm.a_id AND cm.is_del = '0'
      WHERE a.is_del = '0'
        AND cate.is_del = '0'
        ${category_id !== null ? " AND a.category = ?" : ""}
        ${keyword !== null ? ` AND (a.title LIKE ? OR a.description LIKE ?)` : ""}
        ${starttime !== null ? " AND a.add_time >= ?" : ""}
        ${endtime !== null ? " AND a.add_time <= ?" : ""}
      GROUP BY a.id
      ORDER BY a.add_time DESC
    `;

    // 参数数组（顺序要和上面 ? 一致，total 部分和主查询部分一致）
    const params = [];

    // total 子查询参数
    if (category_id !== null) params.push(category_id);
    if (keyword !== null) {
      const likeStr = `%${keyword}%`;
      params.push(likeStr, likeStr, likeStr);
    }
    if (starttime !== null) params.push(starttime);
    if (endtime !== null) params.push(endtime);

    // 主查询参数
    if (category_id !== null) params.push(category_id);
    if (keyword !== null) {
      const likeStr = `%${keyword}%`;
      params.push(likeStr, likeStr, likeStr);
    }
    if (starttime !== null) params.push(starttime);
    if (endtime !== null) params.push(endtime);

    // 分页
    if (pageNo !== null && pageSize !== null) {
      sql += ` LIMIT ${(pageNo - 1) * pageSize}, ${pageSize}`;
    }

    const rows = await connection.queryAsync(sql, params);
    callback(rows);
  } catch (err) {
    console.error(err);
    callback({ error: "服务器内部错误", err });
  }
};

/**
 * 获取文章详情, 包括评论部分
 */
module.exports.getContentDetail = async function (options, callback) {
  const { id } = options;

  function formatDateToSQLString(date) {
    const d = new Date(date);
    const pad = (n) => (n < 10 ? "0" + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` + `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  const curSql = `
          SELECT
              a.id,
              a.title,
              a.category AS category_id,
              c.name AS category,
              c.banner,
              a.composition,
              a.description,
              a.add_time,
              a.view_num,
              a.video_src,
              a.minpic_url,
              a.is_show,
              a.is_del,
              -- 修改部分：使用 COUNT() 作为判断条件
              -- 如果评论数量大于0，则聚合评论，否则返回空数组
              IF(COUNT(comm.t_id) > 0,
                  JSON_ARRAYAGG(
                      JSON_OBJECT(
                          't_id', comm.t_id,
                          'a_id', comm.a_id,
                          'user', comm.user,
                          'time', comm.time,
                          'ip', comm.ip,
                          'comment', comm.comment,
                          'is_del', comm.is_del
                      )
                  ),
                  JSON_ARRAY() -- 如果没有评论，返回一个空的JSON数组 '[]'
              ) AS "comment"
          FROM
              article a
          JOIN
              category c ON a.category = c.id
          LEFT JOIN
              comment comm ON a.id = comm.a_id AND comm.is_del = '0'
          WHERE
              a.id = ?
              AND a.is_del = '0'
              AND a.is_show = '1'
          GROUP BY
              a.id; -- GROUP BY 主键 a.id 即可，其他 a.* 和 c.* 字段在MySQL中被认为是功能依赖于主键的
  `;
  const [cur] = await connection.queryAsync(curSql, [id]);

  if (!cur) {
    callback(null, { code: 0, msg: "没有数据!" });
    return;
  }

  // 修改一下comment的数据类型
  if (cur.comment && typeof cur.comment == "string") {
    cur.comment = JSON.parse(cur.comment);
  }

  if (cur.composition && typeof cur.composition == "string") {
    console.log('查看服务器IP==>>>>>.', utils.getServerIp())
    cur.composition = cur.composition
      .replaceAll('127.0.0.1', utils.getServerIp())
      .replaceAll('localhost', utils.getServerIp());
  }

  const category = cur.category_id;
  const addTime = formatDateToSQLString(cur.add_time);

  const prevSql = `SELECT a.*
                   FROM article a
                   JOIN category c ON a.category = c.id
                   WHERE a.category = ?
                     AND a.is_del = '0'
                     AND a.is_show = '1'
                     AND a.add_time < ?
                   ORDER BY a.add_time DESC
                   LIMIT 1;`;
  const [prev] = await connection.queryAsync(prevSql, [category, addTime]);

  const nextSql = `SELECT a.*
                   FROM article a
                   JOIN category c ON a.category = c.id
                   WHERE a.category = ?
                     AND a.is_del = '0'
                     AND a.is_show = '1'
                     AND a.add_time > ?
                   ORDER BY a.add_time ASC
                   LIMIT 1;`;
  const [next] = await connection.queryAsync(nextSql, [category, addTime]);

  // 新增viewNum
  const viewnumSql = `update article set view_num=${++cur.view_num} where id=${id}`;
  await connection.queryAsync(viewnumSql);

  const res = {
    prev: prev || null,
    cur,
    next: next || null,
  };

  callback(null, res);
};

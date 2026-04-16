const util = require("../util/util");
const getIP = function (req) {
  return util.getClientIp(req).match(/(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)/)[0];
};
/* sql操作 */
const dbMoudle = require("../lib/sqlModule");

/* 获取文章列表数据(包括blog和vlog) */
module.exports.getIndexPage = (req, res) => {
  dbMoudle.getIndexPageData({}, (data) => {
    res.json(data);
  });
};

/* 前端bloglist页面搜索 */
module.exports.searchIndexPage = (req, res) => {
  dbMoudle.doSearch(req, (data) => {
    res.json(data);
  });
};

/* 获取详情页 */
module.exports.getContentPage = (req, res) => {
  var opt = {
    id: req.body.contentid || req.query.contentid,
  };
  dbMoudle.getContentDetail(opt, (err, data) => {
    res.json(data);
  });
};

/* 评论文章 */
module.exports.Comment = (req, res) => {
  const ip = getIP(req);
  var opt = {
    table: "comment",
    id: req.body.contentid || req.query.contentid,
    data: {
      article_id: req.body.contentid || req.query.contentid,
      nickname: req.body.nickname || req.query.nickname || ip,
      content: req.body.content || req.query.content,
      ip: ip,
    },
  };
  dbMoudle.doAdd(opt, (err, data) => {
    if (err) {
      res.json(err);
    } else {
      res.json({ code: "1", msg: "ok" });
    }
  });
};

/* 留言-获取 */
module.exports.getMessages = (req, res) => {
  var opt = {
    table: "messages",
    type: "all",
  };
  dbMoudle.doQuery(opt, (err, data) => {
    res.json(data);
  });
};

/* 用户留言 */
module.exports.leaveMessage = (req, res) => {
  var opt = {
    table: "messages",
    data: {
      nickname: req.query.nickname || req.body.nickname,
      content: req.query.content || req.body.content,
      ip: getIP(req),
    },
  };
  dbMoudle.doAdd(opt, (err, data) => {
    if (err) {
      res.json(err);
    } else {
      res.json({ code: "1", msg: "ok" });
    }
  });
};

/* 访问统计 */
module.exports.visitRecord = (req, res) => {
  var opt = {
    table: "visitors",
    data: {
      ip: getIP(req),
      visited_at: util.getNow(),
    },
  };
  dbMoudle.doAdd(opt, (err, data) => {
    if (err) {
      res.json(err);
    } else {
      res.json({ code: "1", msg: "ok" });
    }
  });
};

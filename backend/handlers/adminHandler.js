const util = require("../util/util");

/* sql操作 */
const dbMoudle = require("../lib/sqlModule");

/* 登陆 */
module.exports.doLogin = (req, res) => {
  const { username, password } = req.body
  dbMoudle.loginQuery({ username, password }, (err, data) => {
    if (err) {
      res.json({ code: 0, msg: "请求错误", err: err });
    }
    if (data.length == 0) {
      res.json({ code: 0, msg: "用户名或密码错误！" });
      return false;
    } else {
      const userInfo = data[0];
      req.session.logData = Object.assign(userInfo, { login: true });
      res.json({
        code: 1,
        msg: "登陆成功! ",
        userInfo,
      });
    }
  });
};
/* 用户-修改 */
module.exports.editInfo = (req, res) => {
  const { type, id, username, password } = req.body || req.query;
  if (type == "check") {
    dbMoudle.loginQuery({ username, password }, (err, data) => {
      if (err) {
        res.json(err);
      } else {
        res.json({ code: 1, msg: "验证通过" });
      }
    });
  } else if (type == "edit") {
    const options = {
      table: "users",
      id,
      data: { username, password },
    };
    dbMoudle.doEdit(options, (err, data) => {
      if (err) {
        res.json(err);
      } else {
        res.json({ code: 1, msg: "修改成功", data });
      }
    });
  }
};

/* *********************管理页首页********************* */
module.exports.getDashboard = (req, res) => {
  dbMoudle.getDashboardData((err, data) => {
    if (err) {
      res.json(err);
    } else {
      res.json(data);
    }
  });
};

/* *********************分类管理********************* */
/* 分类-获取 */
module.exports.getCategory = (req, res) => {
  var opt = {
    table: "category",
    pageNo: req.body.pageNo || 1,
    pageSize: req.body.pageSize || 10,
    type: req.body.serchType || null,
    order: "sort_order",
  };
  dbMoudle.doQuery(opt, (err, data) => {
    res.json({ data });
  });
};
/* 分类-新增 */
module.exports.addCategory = (req, res) => {
  const { name, banner_url, sort_order, show_type } = req.body;
  var obj = {
    table: "category",
    data: {
      name,
      banner_url,
      sort_order,
      ...(show_type ? { show_type } : {}),
    },
  };
  dbMoudle.doAdd(obj, (err, data) => {
    res.json({ code: 1, msg: "success" });
  });
};
/* 分类-删除 */
module.exports.delCategory = (req, res) => {
  var opt = {
    table: "category",
    id: req.body.id,
  };
  dbMoudle.doDel(opt, (err, data) => {
    res.json({ code: 1, msg: "删除成功" });
  });
};
/* 分类-修改 */
module.exports.editCategory = (req, res) => {
  var obj = {
    table: "category",
    id: req.body.id,
    data: {
      name: req.body.name,
      banner_url: req.body.banner_url,
      sort_order: req.body.sort_order,
      ...(req.body.show_type ? { show_type: req.body.show_type } : {}),
    },
  };
  dbMoudle.doEdit(obj, () => {
    res.json({ code: 1, msg: "修改成功" });
  });
};

/* *********************文章管理********************* */
/* 文章-获取 */
module.exports.getArticle = (req, res) => {
  var opt = {
    table: "article",
    type: "articles",
    pageNo: req.body.pageNo || req.query.pageNo || 0,
    pageSize: req.body.pageSize || req.query.pageSize || 10,
  };
  dbMoudle.doQuery(opt, (err, data) => {
    res.json({ data });
  });
};
/* 文章-新增 */
module.exports.addArticle = (req, res) => {
  var obj = {
    table: "article",
    data: {
      title: req.body.title,
      category_id: req.body.category_id,
      content: req.body.content,
      description: req.body.description,
      cover_url: req.body.cover_url,
      video_url: req.body.video_url,
      is_published: req.body.is_published,
      is_pinned: req.body.is_pinned,
    },
  };
  dbMoudle.doAdd(obj, (err, data) => {
    res.json({ code: 1, msg: "success" });
  });
};
/* 文章-删除 */
module.exports.delArticle = (req, res) => {
  var opt = {
    table: "article",
    id: req.body.id,
  };
  dbMoudle.doDel(opt, (err, data) => {
    res.json({ code: 1, msg: "删除成功" });
  });
};
/* 文章-修改 */
module.exports.editArticle = (req, res) => {
  var opt = {
    table: "article",
    id: req.body.id,
    data: {
      title: req.body.title,
      category_id: req.body.category_id,
      content: req.body.content,
      description: req.body.description,
      cover_url: req.body.cover_url,
      video_url: req.body.video_url,
      is_published: req.body.is_published,
      is_pinned: req.body.is_pinned,
    },
  };
  dbMoudle.doEdit(opt, (err) => {
    if (err) {
      res.json({ code: 0, err: err });
    } else {
      res.json({ code: 1, msg: "修改成功" });
    }
  });
};

/* *********************评论管理********************* */
/* 文章评论-获取 */
module.exports.getComment = (req, res) => {
  const { id } = req.query
  dbMoudle.queryCommentList({ id }, (err, data) => {
    res.json(data);
  });
};
/* 文章评论-删除 */
module.exports.delComment = (req, res) => {
  const { id } = req.body
  const opt = {
    id,
    table: "comment",
  };
  dbMoudle.doDel(opt, (err, data) => {
    res.json({ code: 1, msg: "删除成功" });
  });
};

/* *********************留言管理********************* */
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
module.exports.adminGetMessages = (req, res) => {
  const opt = {
    table: "messages",
    pageNo: req.body.pageNo || req.query.pageNo || 1,
    pageSize: req.body.pageSize || req.query.pageSize || 10,
  };
  dbMoudle.queryMessageList(opt, result => {
    res.json(result)
  })
};
/* 留言删除 */
module.exports.delMessage = (req, res) => {
  var opt = {
    table: "messages",
    id: req.body.id || req.query.id,
  };
  dbMoudle.doDel(opt, (err, data) => {
    res.json({ code: 1, msg: "删除成功" });
  });
};

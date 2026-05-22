/**
 * @deprecated 请直接使用 repositories/ 与 services/。
 * 保留为薄封装，便于迁移期兼容旧引用。
 */
const base = require("./repositories/baseRepository");
const userRepo = require("./repositories/userRepository");
const articleRepo = require("./repositories/articleRepository");
const commentRepo = require("./repositories/commentRepository");
const messageRepo = require("./repositories/messageRepository");
const dashboardService = require("./services/dashboardService");
const indexPageService = require("./services/indexPageService");
const contentService = require("./services/contentService");

module.exports = {
  doQuery(options, callback) {
    const { table, pageNo, pageSize, type, order } = options;
    const run = async () => {
      if (type === "all") return base.findAllActive(table);
      if (type === "articles") return articleRepo.listAdmin({ pageNo, pageSize });
      return base.findPageActive(table, { pageNo, pageSize, orderColumn: order });
    };
    run()
      .then((data) => callback(null, data))
      .catch((err) => callback(null, err));
  },

  doAdd(options, callback) {
    base
      .insert(options.table, options.data)
      .then(() => callback())
      .catch((err) => callback(err));
  },

  doDel(options, callback) {
    base
      .softDelete(options.table, options.id)
      .then(() => callback())
      .catch((err) => callback(err));
  },

  doEdit(options, callback) {
    const { table, id, data } = options;
    const run =
      table === "users" && data.password
        ? userRepo.updateUser(id, data)
        : base.updateById(table, id, data);
    run
      .then((res) => callback(null, res))
      .catch((err) => callback(err));
  },

  loginQuery(options, callback) {
    userRepo
      .authenticate(options.username, options.password)
      .then((user) => callback(null, user ? [user] : []))
      .catch((err) => callback(err));
  },

  getDashboardData(callback) {
    dashboardService
      .getDashboardData()
      .then((data) => callback(data))
      .catch((err) => callback(err, null));
  },

  queryCommentList(options, callback) {
    commentRepo
      .findByArticleId(options.id)
      .then((data) => callback(null, data))
      .catch((err) => callback(null, err));
  },

  queryMessageList(options, callback) {
    messageRepo
      .listAdminPage(options)
      .then((data) => callback(data))
      .catch((err) => callback(err));
  },

  getIndexPageData(_options, callback) {
    indexPageService
      .getIndexPageData()
      .then((data) => callback(data))
      .catch((err) => callback({ code: 500, message: err.message }));
  },

  doSearch(req, callback) {
    articleRepo
      .searchPublished(req.body || req)
      .then((data) => callback(data))
      .catch((err) => callback({ error: "服务器内部错误", err }));
  },

  getContentDetail(options, callback) {
    contentService
      .getContentDetail(options.id)
      .then((data) => {
        if (!data) callback(null, { code: 0, msg: "没有数据!" });
        else callback(null, data);
      })
      .catch((err) => callback(err));
  },
};

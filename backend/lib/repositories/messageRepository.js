const { query } = require("../../db/index");
const base = require("./baseRepository");

/** 管理端留言分页列表 */
async function listAdminPage({ pageNo = 1, pageSize = 10 } = {}) {
  const pNo = base.toPositiveInt(pageNo, 1);
  const pSize = base.toPositiveInt(pageSize, 10);
  const [countRows] = await query(
    "SELECT COUNT(*) AS count FROM messages WHERE is_del = '0'"
  );
  const count = countRows[0]?.count ?? 0;
  const messages = await base.findPageActive("messages", { pageNo: pNo, pageSize: pSize });
  return {
    messages,
    pages: Math.ceil(count / pSize),
    total: count,
  };
}

module.exports = { listAdminPage };

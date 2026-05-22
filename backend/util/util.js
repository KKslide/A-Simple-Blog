const os = require('os');

module.exports = {
  dateFormat(tplDate) {
    let date = new Date(tplDate + "");
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours() >= 10 ? date.getHours() : "0" + date.getHours()}:${date.getMinutes() >= 10 ? date.getMinutes() : "0" + date.getMinutes()}:${date.getSeconds() >= 10 ? date.getSeconds() : "0" + date.getSeconds()}`;
  },
  getNow() {
    let date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours() >= 10 ? date.getHours() : "0" + date.getHours()}:${date.getMinutes() >= 10 ? date.getMinutes() : "0" + date.getMinutes()}:${date.getSeconds() >= 10 ? date.getSeconds() : "0" + date.getSeconds()}`;
  },
  /**
   * 从请求中读取客户端 IP (兼容反向代理自定义头)
   */
  getClientIp(req) {
    try {
      const raw =
        req.headers["x-forwarded-for"] ||
        req.headers["x-real-ip"] ||
        req.headers["x-wq-realip"] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.connection?.socket?.remoteAddress ||
        "";
      const first = String(raw).split(",")[0].trim();
      return module.exports.normalizeClientIp(first);
    } catch (e) {
      return "";
    }
  },

  /**
   * 规范化 IPv4 字符串, 去掉 ::ffff: 前缀
   */
  normalizeClientIp(ip) {
    if (!ip) return "";
    let value = String(ip).trim();
    if (value.startsWith("::ffff:")) value = value.slice(7);
    const match = value.match(
      /(25[0-5]|2[0-4]\d|[0-1]?\d{1,2})\.(25[0-5]|2[0-4]\d|[0-1]?\d{1,2})\.(25[0-5]|2[0-4]\d|[0-1]?\d{1,2})\.(25[0-5]|2[0-4]\d|[0-1]?\d{1,2})/
    );
    return match ? match[0] : value;
  },
  /**
   * 获取服务器本地 IP
   * @returns {string}
   */
  getServerIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return 'localhost';
  }
};

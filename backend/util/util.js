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
   * 获取用户ip
   */
  getClientIp(req) {
    try {
      return req.headers["x-wq-realip"] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    } catch (e) {
      // @ts-ignore
      logger.info("getClientIp error");
      return "";
    }
  },
  /**
   * 获取服务器本地 IP
   * @returns String
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

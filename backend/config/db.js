/** MySQL 连接配置（从环境变量读取） */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

module.exports = {
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASS || "",
  database: process.env.MYSQL_DATABASE || "myblog",
  charset: "utf8mb4",
  connectionLimit: 10,
  waitForConnections: true,
  enableKeepAlive: true,
};

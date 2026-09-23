/** MySQL 连接配置（从环境变量读取） */
import dotenv from 'dotenv'
import { ENV_PATH } from './paths.ts'

// 在模块加载时确保 .env 已加载（dotenv 默认不覆盖已有环境变量，重复加载幂等）
dotenv.config({ path: ENV_PATH })

export const dbConfig = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASS || '',
  database: process.env.MYSQL_DATABASE || 'myblog',
  charset: 'utf8mb4',
  connectionLimit: 10,
  waitForConnections: true,
  enableKeepAlive: true,
}

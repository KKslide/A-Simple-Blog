/**
 * 数据库连接池与查询封装
 *
 * query() 带泛型，可将结果断言为具体行类型：
 *   const [rows] = await query<ArticleRow[]>("SELECT * FROM article");
 */
import mysql from 'mysql2/promise'
import { dbConfig } from '../config/db.ts'

export const pool = mysql.createPool(dbConfig)

/**
 * 行结果辅助类型：T[] 与 mysql2 的 RowDataPacket[] 相交，
 * 使 query<T> 可以直接断言为业务实体数组。
 */
export type Rows<T> = T[] & mysql.RowDataPacket[]

pool
  .getConnection()
  .then((conn) => {
    console.log('数据库连上啦- -。')
    conn.release()
  })
  .catch((err: Error) => {
    console.error('数据库连接失败:', err.message)
  })

/**
 * 执行参数化 SQL
 * @param sql SQL 语句
 * @param params 占位符参数
 * @returns [行结果, 字段元信息]
 */
export async function query<T extends mysql.QueryResult = mysql.RowDataPacket[]>(
  sql: string,
  params: unknown[] = [],
): Promise<[T, mysql.FieldPacket[]]> {
  return pool.query<T>(sql, params as mysql.QueryValues)
}

/** 优雅关闭连接池 */
export async function closePool() {
  await pool.end()
  console.log('数据库连接池已关闭')
}

/**
 * 前台处理器
 *
 * 遵循 RESTful 规范：
 * - 资源 ID 从路径参数获取（req.params.id）
 * - 查询参数从 req.query 获取
 * - 请求体从 req.body 获取
 */

import type { NextFunction, Request, Response } from 'express'
import * as util from '../util/util.ts'
import * as base from '../lib/repositories/baseRepository.ts'
import * as articleRepo from '../lib/repositories/articleRepository.ts'
import * as indexPageService from '../lib/services/indexPageService.ts'
import * as contentService from '../lib/services/contentService.ts'
import * as visitService from '../lib/services/visitService.ts'
import * as articleViewService from '../lib/services/articleViewService.ts'
import { success, fail } from '../lib/response.ts'

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown

/**
 * GET /articles
 * 获取首页文章列表（按分类分组）
 */
async function getIndexPage(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await indexPageService.getIndexPageData()
    return success(res, { data })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /articles/search
 * 搜索文章
 */
async function searchIndexPage(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await articleRepo.searchPublished(req.query as Record<string, unknown>) // GET 请求，参数从 query 获取
    return success(res, { data })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /articles/:id
 * 获取文章详情（含上下篇和评论）
 */
async function getContentPage(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id // 从路径参数获取 ID
    const data = await contentService.getContentDetail(id)
    if (!data) return fail(res, '文章不存在')
    return success(res, { data })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /articles/:id/comments
 * 发表评论
 */
async function Comment(req: Request, res: Response, next: NextFunction) {
  try {
    const ip = util.getClientIp(req)
    const articleId = req.params.id // 从路径参数获取文章 ID
    const nickname = (req.body.nickname || ip).toString().trim()
    const content = (req.body.comment || '').toString().trim()

    // 输入校验
    if (!content) return fail(res, '评论内容不能为空')
    if (content.length > 500) return fail(res, '评论内容不能超过500字')
    if (nickname.length > 50) return fail(res, '昵称不能超过50字')

    await base.insert('comment', {
      // 保持原行为：路径参数原样传入，由 MySQL 隐式转换（非法值会由数据库报错）
      article_id: articleId as unknown as number,
      nickname,
      content,
      ip,
    })
    return success(res, { msg: '评论成功' })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /messages
 * 获取留言列表
 */
async function getMessages(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await base.findAllActive('messages')
    return success(res, { data })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /messages
 * 提交留言
 */
async function leaveMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const ip = util.getClientIp(req)
    const nickname = (req.body.nickname || ip).toString().trim()
    const content = (req.body.content || '').toString().trim()

    // 输入校验
    if (!content) return fail(res, '留言内容不能为空')
    if (nickname.length > 50) return fail(res, '昵称不能超过50字')
    if (content.length > 500) return fail(res, '留言内容不能超过500字')

    await base.insert('messages', {
      nickname,
      content,
      ip,
    })
    return success(res, { msg: '留言成功' })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /visits
 * 记录全站访问（PV）
 */
async function visitRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await visitService.recordSiteVisit(req)
    return success(res, { msg: '访问已记录', data: result })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /articles/:id/view
 * 记录文章阅读（IP+日期去重）
 */
async function recordArticleView(req: Request, res: Response, next: NextFunction) {
  try {
    const articleId = req.params.id // 从路径参数获取文章 ID
    const ip = util.getClientIp(req)
    const result = await articleViewService.recordArticleView(articleId, ip)
    return success(res, { msg: '阅读已记录', data: result })
  } catch (err) {
    const e = err as { status?: number; message?: string }
    if (e.status === 400 || e.status === 404) return fail(res, e.message || '')
    next(err)
  }
}

const indexHandler: Record<string, Handler> = {
  getIndexPage,
  searchIndexPage,
  getContentPage,
  Comment,
  getMessages,
  leaveMessage,
  visitRecord,
  recordArticleView,
}

export default indexHandler

/**
 * 项目路径常量
 *
 * 源码运行时: backend/src/config/paths.ts
 * 构建产物: www/config/paths.js
 *
 * 开发环境资源在 backend/, 构建产物资源在 www/
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const moduleDir = path.dirname(fileURLToPath(import.meta.url))
const isSourceLayout = moduleDir.endsWith(path.join('src', 'config'))

/** 项目根目录 */
export const PROJECT_ROOT = isSourceLayout
  ? path.resolve(moduleDir, '../../..')
  : path.resolve(moduleDir, '../..')

/** 运行时资源根目录: 开发为 backend/, 构建产物为 www/ */
export const ROOT_DIR = isSourceLayout
  ? path.join(PROJECT_ROOT, 'backend')
  : path.join(PROJECT_ROOT, 'www')

/** 构建产物目录 (www/) */
export const WWW_DIR = path.join(PROJECT_ROOT, 'www')

/** .env 配置文件路径 */
export const ENV_PATH = path.join(ROOT_DIR, '.env')

/** 本地上传目录 */
export const UPLOAD_DIR = path.join(ROOT_DIR, 'upload')

/** ECharts 地图 GeoJSON 数据目录 */
export const MAP_JSON_DIR = path.join(ROOT_DIR, 'json/map')

/** 前端构建产物目录 (www/dist) */
export const FRONTEND_DIST_DIR = path.join(WWW_DIR, 'dist')

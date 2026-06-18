import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * 自动解析 @element-plus/icons-vue 图标组件
 *
 * 工作原理：
 * 1. Vite 启动时，从 @element-plus/icons-vue 包的 dist 文件中读取全部图标名称，存入 Set
 * 2. 模板里写 <View />、<Search /> 等图标时，unplugin-vue-components 遍历所有 resolvers
 * 3. ElementPlusResolver 只处理 el-xxx 组件，不认识 View，跳过
 * 4. 本 resolver 发现 View 在 Set 中 → 返回 { name, from: '@element-plus/icons-vue' }
 * 5. Vite 只打包实际用到的图标，实现按需导入 + 自动 tree-shaking
 *
 * 使用方式：模板中直接写图标组件名即可，无需手动注册或维护图标列表
 *   <el-icon><View /></el-icon>
 *   <el-icon><Search /></el-icon>
 *
 * 新增图标也自动识别，零维护。
 */
export function epIconResolver() {
  // 启动时从包中读取所有图标名称（当前共 293 个）
  const names = new Set<string>()
  try {
    const distPath = resolve(process.cwd(), 'node_modules/@element-plus/icons-vue/dist/index.js')
    const content = readFileSync(distPath, 'utf-8')
    // 图标组件在 dist 中以 name: "Xxx" 形式导出
    const matches = content.matchAll(/name:\s*"([A-Z][a-zA-Z]+)"/g)
    for (const m of matches) names.add(m[1])
  } catch {
    console.warn('[ep-icon-resolver] 无法读取 @element-plus/icons-vue')
  }

  return {
    type: 'component' as const,
    resolve(name: string) {
      if (names.has(name)) {
        return {
          name,
          from: '@element-plus/icons-vue',
          sideEffects: false,
        }
      }
    }
  }
}

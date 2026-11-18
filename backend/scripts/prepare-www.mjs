import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const projectRoot = path.resolve(backendDir, '..')
const wwwDir = path.join(projectRoot, 'www')

fs.mkdirSync(wwwDir, { recursive: true })

const pkg = JSON.parse(fs.readFileSync(path.join(backendDir, 'package.json'), 'utf8'))
pkg.scripts = { start: 'node bin/www.js' }
fs.writeFileSync(path.join(wwwDir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')

for (const file of ['pnpm-lock.yaml', 'pnpm-workspace.yaml', '.env.example']) {
  const from = path.join(backendDir, file)
  if (fs.existsSync(from)) fs.copyFileSync(from, path.join(wwwDir, file))
}

fs.cpSync(path.join(backendDir, 'json'), path.join(wwwDir, 'json'), { recursive: true })
fs.mkdirSync(path.join(wwwDir, 'upload'), { recursive: true })

console.log('prepared www/')

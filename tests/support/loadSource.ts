import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'

export function loadSource<T>(source: string, dependencies: Record<string, unknown>): T {
  const names = [...source.matchAll(/export (?:async function|function|const) (\w+)/g)]
    .map(match => match[1])
  const code = stripTypeScriptTypes(source).replace(/\bexport\s+/g, '')
  return new Function(...Object.keys(dependencies), `${code}\nreturn { ${names.join(', ')} }`)(
    ...Object.values(dependencies)
  ) as T
}

export function extractSource(path: URL, name: string) {
  const source = readFileSync(path, 'utf8')
  const match = new RegExp(`export (?:async function|const) ${name}\\b`).exec(source)
  assert.ok(match, `Missing source: ${name}`)
  const next = source.indexOf('\nexport ', match.index + match[0].length)
  return source.slice(match.index, next === -1 ? undefined : next)
}

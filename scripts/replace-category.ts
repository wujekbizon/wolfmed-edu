import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

type QuestionRecord = {
  meta?: { course?: string; category?: string; [key: string]: unknown }
  [key: string]: unknown
}

const DEFAULT_FILE = 'data/tests.json'

function usage(): never {
  console.error(
    'Usage: pnpm run tests:replace-category -- <old-category> <new-category> [--file <path>] [--output <path>] [--dry-run]'
  )
  console.error(`Defaults: --file ${DEFAULT_FILE}, --output = --file (in place)`)
  process.exit(1)
}

function parseArgs(args: string[]) {
  const positional: string[] = []
  let file = DEFAULT_FILE
  let output: string | undefined
  let dryRun = false

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === undefined || arg === '--') {
      continue
    } else if (arg === '--dry-run') {
      dryRun = true
    } else if (arg === '--file' || arg === '--output') {
      const value = args[i + 1]
      if (!value || value.startsWith('--')) {
        console.error(`Missing value for ${arg}`)
        usage()
      }
      if (arg === '--file') file = value
      else output = value
      i += 1
    } else if (arg.startsWith('--')) {
      console.error(`Unknown argument: ${arg}`)
      usage()
    } else {
      positional.push(arg)
    }
  }

  const [oldCategory, newCategory] = positional
  if (oldCategory === undefined || newCategory === undefined || positional.length !== 2) usage()

  return { oldCategory, newCategory, file, output: output ?? file, dryRun }
}

async function main() {
  const { oldCategory, newCategory, file, output, dryRun } = parseArgs(process.argv.slice(2))
  const inputPath = resolve(file)
  const outputPath = resolve(output)

  const source = await readFile(inputPath, 'utf8')
  const json: unknown = JSON.parse(source)

  if (!Array.isArray(json)) {
    throw new Error(`Expected an array of records in ${inputPath}`)
  }

  let changed = 0
  for (const value of json as QuestionRecord[]) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue
    const meta = value.meta
    if (meta && meta.category === oldCategory) {
      meta.category = newCategory
      changed += 1
    }
  }

  console.log(`${oldCategory} -> ${newCategory}: ${changed} record(s) matched.`)

  if (changed === 0) {
    console.log('Nothing to write.')
    return
  }

  if (dryRun) {
    console.log('Dry run - no file written.')
    return
  }

  const trailingNewline = source.endsWith('\n') ? '\n' : ''
  await writeFile(outputPath, `${JSON.stringify(json, null, 2)}${trailingNewline}`, 'utf8')
  console.log(`Wrote: ${outputPath}`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})

import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export async function practicalTimingBundle() {
  const require = createRequire(import.meta.url)
  const { build } = createRequire(require.resolve('tsx'))('esbuild')
  const root = fileURLToPath(new URL('../../../', import.meta.url))
  const workspace = readFileSync(new URL('../../../src/components/PracticalExamWorkspace.tsx', import.meta.url), 'utf8')
  if (!workspace.includes('onTimeUp={() => formRef.current?.requestSubmit()}')) {
    throw new Error('Workspace expiry wiring changed: update timing probe before interpreting results')
  }
  const sections = readFileSync(new URL('../../../src/components/PracticalExamSections.tsx', import.meta.url), 'utf8')
  if (!sections.includes('onSubmitCapture={session.handleSubmitCapture}') || !workspace.includes('isSubmitting={session.isPending}')) {
    throw new Error('Submission capture/pending wiring changed: update timing probe')
  }
  const boundaries = {
    name: 'mock-grading-and-toast',
    setup(build: any) {
      build.onResolve({ filter: /^@\/actions\/praktyczny$/ }, () => ({ path: fileURLToPath(new URL('./practicalTimingGrader.ts', import.meta.url)) }))
      build.onResolve({ filter: /^@\/hooks\/useToastMessage$/ }, () => ({ path: 'toast', namespace: 'timing-mock' }))
      build.onLoad({ filter: /.*/, namespace: 'timing-mock' }, () => ({ contents: 'export const useToastMessage = () => null' }))
      build.onResolve({ filter: /^(@clerk|@upstash|pg$|postgres$|drizzle|@\/server\/)/ }, (args: { path: string }) => {
        throw new Error(`Real service dependency reached: ${args.path}`)
      })
    },
  }
  const result = await build({
    absWorkingDir: root, entryPoints: ['tests/integration/support/practicalTimingBrowser.tsx'],
    bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"development"' }, plugins: [boundaries],
  })
  return result.outputFiles[0]!.text
}

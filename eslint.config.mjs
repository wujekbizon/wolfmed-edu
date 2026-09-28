import { defineConfig, globalIgnores } from 'eslint/config'
import { createRequire } from 'node:module'
import nextParser from 'eslint-config-next/parser'
import clerkNext from '@clerk/eslint-plugin/next'

const requireNextDependency = createRequire(import.meta.resolve('eslint-config-next/parser'))
const nextPlugin = requireNextDependency('@next/eslint-plugin-next')
const hooksPlugin = requireNextDependency('eslint-plugin-react-hooks')
const globals = requireNextDependency('globals')
const parser = {
  meta: nextParser.meta,
  parseForESLint(source, options) {
    const { ast, visitorKeys, services } = nextParser.parseForESLint(source, options)
    return { ast, visitorKeys, services }
  },
}

export default defineConfig([
  {
    files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
    languageOptions: {
      parser,
      parserOptions: {
        requireConfigFile: false,
        sourceType: 'module',
        babelOptions: { presets: ['next/babel'], caller: { supportsTopLevelAwait: true } },
      },
      globals: { ...globals.browser, ...globals.node },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      '@clerk/next': clerkNext,
      '@next/next': nextPlugin,
      'react-hooks': hooksPlugin,
    },
    rules: {
      ...nextPlugin.configs['core-web-vitals'].rules,
      "@clerk/next/require-auth-protection": [
        "error",
        {
         protected: [
            "app/panel/**",
            "app/blog/**",
            "app/forum/**",
            "app/admin/**",
         ],
         public: ['src/app/sign-in/**', 'src/app/sign-up/**'],
         resources: {
            routeHandlers: true,
            serverFunctions: true,
          serverComponentEntrypoints: false,
          },
        },
      ],
    },
  },
  {
    files: ['src/components/wolfek/**/*.{ts,tsx}', 'src/hooks/useFloatingPanelPosition.ts'],
    rules: hooksPlugin.configs.flat.recommended.rules,
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])

import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'
/** @type {import('next').NextConfig} */

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  experimental: {
    reactCompiler: true,
    ppr: 'incremental',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
        pathname: '/a/zw3dk8dyy9/**',
      },
    ],
  },
  webpack: (config: any, { webpack }: any) => {
    config.experiments = { ...config.experiments, topLevelAwait: true }
    config.externals['node:fs'] = 'commonjs node:fs'
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    }
    config.cache = {
      type: 'memory',
    }
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: any) => {
        resource.request = resource.request.replace(/^node:/, '')
      })
    )

    return config
  },
}
export default withSentryConfig(nextConfig, {
  org: 'wesa-vs',
  project: 'wolfmed-edukacja',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: { disable: true },
  disableLogger: true,
  automaticVercelMonitors: true,
})

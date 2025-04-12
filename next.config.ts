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
  webpack: (config) => {
    config.cache = {
      type: 'memory',
    }
    return config
  },
}
export default withSentryConfig(nextConfig, {
  org: 'wesa-vs',
  project: 'wolfmed-edukacja',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  sourcemaps: { disable: true },
  disableLogger: true,
  automaticVercelMonitors: true,
})

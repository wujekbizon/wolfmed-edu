import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'
/** @type {import('next').NextConfig} */

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
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
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
      cacheOptions: {
        // Adjust cache serialization strategy
        buffer: true,
      },
    }
    return config
  },
}
export default withSentryConfig(nextConfig, {
  org: 'wesa-vs',
  project: 'wolfmed-edukacja',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
  automaticVercelMonitors: true,
})

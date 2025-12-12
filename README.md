## Wolfmed

Edukacja medyczna może być jeszcze łatwiejsza.

# Local Development

## Setup Steps

1. Start the development server:
```bash
pnpm run dev
```

2. Start Ngrok tunnel on port 3000:
```bash
ngrok http 3000
```

3. Update Clerk webhook endpoints:
   - Go to Clerk Dashboard/Development > Configure > Webhooks
   - Update the webhook URL with your new Ngrok URL
   - Format: `https://[your-ngrok-url]/api/webhooks/clerk`
   - Remember: With free Ngrok plan, URL changes each time you restart Ngrok
   - Don't forget update CLERK_WEBHOOK_SECRET each time yo add new endpoint
   
## Database Management

### Working with Neon Database Branches

1. Create a new branch:
```bash
neonctl branches create --name [branch-name]
```

2. Get connection string for the branch:
```bash
neonctl connection-string --branch [branch-name]
```

3. Update your `.env.local`:
```env
NEON_DATABASE_URL="your-new-branch-connection-string"
```

## Important Notes

- Always update Clerk webhook URL when starting new Ngrok session
- Keep your `.env.local` up to date with the correct database branch
- Test webhooks functionality after updating Clerk endpoints

## Troubleshooting

- If webhooks aren't working, verify:
  1. Ngrok is running
  2. Clerk webhook URL is updated
  3. Your app is running on port 3000


  # Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.1.0] - 2025-12-12

### Changed
- Migrated from React cache() to Next.js 16 'use cache' directive across ~30 queries
- Replaced async generateMetadata with static metadata objects in all dynamic routes
- Implemented comprehensive cacheLife strategies (minutes/hours/days/max) based on data volatility
- Added granular cache tag revalidation across all server actions

### Added
- AllTestsSkeleton component for category test pages
- Enhanced LearningHubDashboardSkeleton with premium lock overlays
- Suspense boundaries with proper params handling in /kierunki/[slug]
- Cache tags for user-specific, procedure-specific, and analytics data
- Revalidation tags in challenges actions (completions, badges)
- Revalidation tags in materials, cells, notes, forum, blog, and test actions

### Fixed
- crypto.randomUUID() errors in generateMetadata by using static metadata
- Cache invalidation issues across testimonials, forum posts/comments, materials, challenges
- Missing revalidation tags for analytics queries

### Performance
- Optimized query caching with appropriate lifecycles
- Improved cache hit rates with user-specific and resource-specific tags
- Reduced database load through strategic max lifetime caching

## [4.0.3] - 2025-12-10

### Fixed
- Fixed test results page crash when viewing deleted/non-existent test
- Added redirect to results list when test doesn't exist instead of error

## [4.0.2] - 2025-12-09

### Added
- Merge official materials with user materials for improved resource availability
- Official materials retrieval method in fetchData

### Changed
- Material upload button now conditionally rendered based on user support status
- Delete button only shown for user-created materials (not system materials)
- Optimized database connection settings

## [4.0.1] - 2025-12-05

### Fixed
- Fixed race condition in material upload that could allow storage limit to be exceeded
- Fixed userLimits table creation - now only created for supporters

### Changed
- Material upload validation now happens atomically within database transaction
- Improved error messages - translated to Polish for user-facing errors
- UserLimits record now created when user becomes supporter (payment webhook)

### Security
- Prevented concurrent uploads from bypassing storage limit checks

## [4.0.0] - 2025-12-04
- Initial major release with Next.js 16, React 19, and React Compiler
- Medical education platform with test-taking, procedural learning, and community forum
- Stripe payment integration for supporter features
- File upload system with storage quotas for supporters
- Rich text editor for study materials
- User dashboard with customizable widgets

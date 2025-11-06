/**
 * Seed script to migrate blog posts from JSON to database
 * Run with: tsx scripts/seedBlogPosts.ts
 */

import { db } from '../src/server/db/index'
import { blogPosts, blogCategories } from '../src/server/db/schema'
import { generateSlug, calculateReadingTime } from '../src/lib/blogUtils'
import { eq } from 'drizzle-orm'
import blogPostsData from '../data/blogPosts.json'

// You'll need to set this to your Clerk user ID (get from Clerk dashboard)
const ADMIN_USER_ID = process.env.ADMIN_USER_ID || 'user_default_admin'
const ADMIN_USER_NAME = process.env.ADMIN_USER_NAME || 'Admin Wolfmed'

interface OldBlogPost {
  id: string
  title: string
  date: string
  excerpt: string
  content: string
}

async function seedBlogPosts() {
  console.log('🌱 Starting blog posts migration...')

  try {
    // First, create default category if it doesn't exist
    console.log('📁 Checking for default category...')
    const [defaultCategory] = await db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.slug, 'opieka-medyczna'))
      .limit(1)

    let categoryId: string | null = null

    if (!defaultCategory) {
      console.log('📁 Creating default category...')
      const [newCategory] = await db
        .insert(blogCategories)
        .values({
          name: 'Opieka Medyczna',
          slug: 'opieka-medyczna',
          description: 'Artykuły o opiece medycznej i pracy opiekuna',
          color: '#ef4444',
          order: 0,
        })
        .returning()

      categoryId = newCategory!.id
      console.log('✅ Default category created:', categoryId)
    } else {
      categoryId = defaultCategory.id
      console.log('✅ Using existing category:', categoryId)
    }

    // Migrate blog posts
    console.log(`\n📝 Migrating ${blogPostsData.length} blog posts...`)

    for (const oldPost of blogPostsData as OldBlogPost[]) {
      const slug = generateSlug(oldPost.title)
      const readingTime = calculateReadingTime(oldPost.content)
      const publishedAt = new Date(oldPost.date)

      console.log(`  • Migrating: "${oldPost.title}"`)
      console.log(`    Slug: ${slug}`)
      console.log(`    Reading time: ${readingTime} min`)

      // Check if post already exists by slug
      const existing = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, slug))
        .limit(1)

      if (existing.length > 0) {
        console.log(`    ⚠️  Post already exists, skipping...`)
        continue
      }

      await db.insert(blogPosts).values({
        title: oldPost.title,
        slug,
        excerpt: oldPost.excerpt,
        content: oldPost.content,
        categoryId,
        authorId: ADMIN_USER_ID,
        authorName: ADMIN_USER_NAME,
        status: 'published',
        publishedAt,
        date: oldPost.date, // Keep legacy date field
        readingTime,
        viewCount: 0,
      })

      console.log(`    ✅ Migrated successfully`)
    }

    console.log('\n✨ Migration completed successfully!')
    console.log(`\n📊 Summary:`)
    console.log(`   Total posts in JSON: ${blogPostsData.length}`)

    const totalInDb = await db.select().from(blogPosts)
    console.log(`   Total posts in DB: ${totalInDb.length}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the seed
seedBlogPosts()

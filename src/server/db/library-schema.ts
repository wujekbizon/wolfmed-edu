import {
  pgTableCreator,
  text,
  integer,
  timestamp,
  varchar,
  vector,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { EMBED_DIM } from '@/constants/embeddings'
import { LIB_TABLE } from '@/server/library/config'
import { users } from './schema'

// Local table creator (same 'wolfmed_' prefix as the main schema). Declared here
// rather than imported from schema.ts to avoid a circular import — schema.ts
// re-exports this file so drizzle-kit and the ORM see the table.
const libTable = pgTableCreator((name) => `wolfmed_${name}`)

const uuidText = sql`gen_random_uuid()::text`

/**
 * Chunks of a student's own notes and uploaded materials.
 *
 * Isolation is structural: userId carries a foreign key to users, so a deleted
 * account takes its chunks with it and no query can reach another student's
 * rows without dropping the scope clause.
 *
 * `embedding` is nullable on purpose. Rows are written synchronously with the
 * source, and vectors are filled afterwards — an unembedded chunk is invisible
 * to vector search but fully visible to the trigram index, so a note is findable
 * by its words the moment it saves.
 */
export const libChunks = libTable(
  LIB_TABLE,
  {
    chunkId: text('chunk_id').primaryKey().default(uuidText),
    userId: varchar('user_id', { length: 256 })
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    sourceType: text('source_type').notNull(),
    sourceId: text('source_id').notNull(),
    title: text('title').notNull(),
    position: integer('position').notNull(),
    content: text('content').notNull(),
    // Lets a re-save carry an unchanged chunk's vector across instead of
    // re-embedding it, and skip the write entirely.
    contentHash: text('content_hash').notNull(),
    embedding: vector('embedding', { dimensions: EMBED_DIM }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Scope before rank: every read filters the owner first.
    index('idx_lib_chunk_scope').on(t.userId, t.sourceType),
    // Replacing one source's chunks, and resolving an @attachment to its rows.
    index('idx_lib_chunk_source').on(t.sourceId, t.position),
    // One row per position within a source, so a re-save cannot duplicate.
    uniqueIndex('uq_lib_chunk_position').on(t.sourceId, t.position),
    index('idx_lib_chunk_trgm').using('gin', t.content.op('gin_trgm_ops')),
    index('idx_lib_chunk_vec').using('hnsw', t.embedding.op('vector_cosine_ops')),
    // Drives the embedding sweep, which only ever looks at unembedded rows.
    index('idx_lib_chunk_pending')
      .on(t.userId)
      .where(sql`${t.embedding} is null`),
  ]
)

export type LibChunk = typeof libChunks.$inferSelect
export type NewLibChunk = typeof libChunks.$inferInsert

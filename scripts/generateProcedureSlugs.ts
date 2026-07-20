/**
 * Regenerates src/constants/procedureSlugs.ts from data/procedures.json.
 * Slugs are read from each record's baked-in `slug` field (the same value
 * seeded into the DB), so the client-side map can never drift from the DB.
 * Only opiekun-medyczny is included — pielęgniarstwo components slugify
 * at runtime via getPielegniastwoSlug.
 *
 * Run with: npx tsx scripts/generateProcedureSlugs.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ProcedureRecord {
  id: string;
  slug: string;
  data: { meta?: { course?: string }; name: string };
}

const proceduresPath = path.join(__dirname, '../data/procedures.json');
const procedures: ProcedureRecord[] = JSON.parse(fs.readFileSync(proceduresPath, 'utf8'));

const slugToId: Record<string, string> = {};
const idToSlug: Record<string, string> = {};

procedures
  .filter((procedure) => procedure.data.meta?.course === 'opiekun-medyczny')
  .forEach((procedure) => {
    if (!procedure.slug) throw new Error(`Missing slug for procedure ${procedure.id}`);
    slugToId[procedure.slug] = procedure.id;
    idToSlug[procedure.id] = procedure.slug;
  });

const tsContent = `/**
 * Auto-generated procedure slug mappings (opiekun-medyczny)
 * Generated from: data/procedures.json (slug field)
 * Last updated: ${new Date().toISOString()}
 *
 * To regenerate: npx tsx scripts/generateProcedureSlugs.ts
 */

// Slug to ID mapping (for routing)
export const PROCEDURE_SLUG_TO_ID: Record<string, string> = ${JSON.stringify(slugToId, null, 2)}

// ID to Slug mapping (for generating links)
export const PROCEDURE_ID_TO_SLUG: Record<string, string> = ${JSON.stringify(idToSlug, null, 2)}

// Helper to get procedure ID from slug
export function getProcedureIdFromSlug(slug: string): string | undefined {
  return PROCEDURE_SLUG_TO_ID[slug]
}

// Helper to get procedure slug from ID
export function getProcedureSlugFromId(id: string): string | undefined {
  return PROCEDURE_ID_TO_SLUG[id]
}
`;

const outputPath = path.join(__dirname, '../src/constants/procedureSlugs.ts');
fs.writeFileSync(outputPath, tsContent, 'utf8');
console.log(`Wrote ${Object.keys(slugToId).length} opiekun-medyczny slug mappings`);

/**
 * Script to generate procedure slug mappings from procedures.json
 * Run with: tsx scripts/generateProcedureSlugs.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ProcedureData {
  name: string;
  image: string;
  algorithm: Array<{ step: string }>;
  equipment?: string[];
}

interface Procedure {
  id: string;
  data: ProcedureData;
}

// Slugify function (same as TypeScript helper)
function generateProcedureSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Replace Polish characters
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ź/g, 'z')
    .replace(/ż/g, 'z')
    // Replace spaces and special chars with hyphens
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

// Read procedures.json
const proceduresPath = path.join(__dirname, '../data/procedures.json');
const procedures: Procedure[] = JSON.parse(fs.readFileSync(proceduresPath, 'utf8'));

// Generate slug-to-ID mapping
const slugToId: Record<string, string> = {};
const idToSlug: Record<string, string> = {};

procedures.forEach(procedure => {
  const slug = generateProcedureSlug(procedure.data.name);
  slugToId[slug] = procedure.id;
  idToSlug[procedure.id] = slug;

  console.log(`${procedure.data.name} -> ${slug}`);
});

// Generate TypeScript constants file
const tsContent = `/**
 * Auto-generated procedure slug mappings
 * Generated from: data/procedures.json
 * Last updated: ${new Date().toISOString()}
 *
 * To regenerate: tsx scripts/generateProcedureSlugs.ts
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

// Write to constants file
const outputPath = path.join(__dirname, '../src/constants/procedureSlugs.ts');
fs.writeFileSync(outputPath, tsContent, 'utf8');

console.log('\n✅ Generated:', outputPath);
console.log(`📊 Total procedures: ${procedures.length}`);

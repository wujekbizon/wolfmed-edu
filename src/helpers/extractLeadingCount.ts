/**
 * Reads an item count off the front of a typed command, so „/utworz 10 pytań z
 * anatomii" and the chip palette's number field arrive at the tool by the same
 * route — a validated number, never prose for the dispatch model to re-extract.
 *
 * Only the first token counts. A number further in is part of the subject
 * („pytania o 12 parach nerwów czaszkowych" asks for questions about twelve
 * pairs, not twelve questions), and guessing there would trade one silent wrong
 * count for another.
 */
export function extractLeadingCount(text: string): number | null {
  const firstToken = text.trim().split(/\s+/)[0]
  if (!firstToken || !/^\d{1,3}$/.test(firstToken)) return null

  return Number(firstToken)
}

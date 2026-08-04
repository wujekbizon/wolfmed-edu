// Belt and braces for the prompt rule against inline citations. Models echo
// context markers regardless of instructions, and "[10, TWÓJ MATERIAŁ]" points
// at an internal list position the student never sees.
//
// Deliberately narrow: only brackets built purely from digits, commas and the
// three origin labels. Anything else — [Na+], [Ryc. 2], a markdown link — is
// content and is left alone.
const CITATION = /\s*\[(?:\d+|BAZA WIEDZY|TWÓJ MATERIAŁ|TWOJA NOTATKA)(?:\s*,\s*(?:\d+|BAZA WIEDZY|TWÓJ MATERIAŁ|TWOJA NOTATKA))*\]/gu

// The pattern eats the space in front of the bracket, so "płynna [4] ," and
// "pierwszy [1] drugi" close up on their own. Collapsing whitespace afterwards
// would only damage the indentation of Gemini's markdown bullets.
export function stripContextCitations(answer: string): string {
  return answer.replace(CITATION, '').replace(/[ \t]+$/gm, '')
}

// Belt and braces for the prompt rule against inline citations. Models echo
// context markers regardless of instructions, and "[10, TWÓJ MATERIAŁ]" points
// at an internal list position the student never sees.
//
// Deliberately narrow: only brackets built purely from digits, commas and the
// three origin labels. Anything else — [Na+], [Ryc. 2], a markdown link — is
// content and is left alone.
const ORIGIN = '(?:BAZA WIEDZY|TWÓJ MATERIAŁ|TWOJA NOTATKA)'
const ITEM = `(?:\\d+|${ORIGIN})`

const SQUARE = new RegExp(`\\s*\\[${ITEM}(?:\\s*,\\s*${ITEM})*\\]`, 'gu')

// Forbidding the markers in square brackets moved them into parentheses, so the
// same shape has to be caught there. Stricter than the square form: an origin
// label must be present. A bare "(1)" in Polish prose is a list marker far more
// often than a citation, and stripping it would edit the student's content.
const PAREN = new RegExp(`\\s*\\((?:\\d+\\s*,\\s*)*${ORIGIN}(?:\\s*,\\s*${ITEM})*\\)`, 'gu')

// The patterns eat the space in front of the bracket, so "płynna [4] ," and
// "pierwszy [1] drugi" close up on their own. Collapsing whitespace afterwards
// would only damage the indentation of Gemini's markdown bullets.
export function stripContextCitations(answer: string): string {
  return answer.replace(SQUARE, '').replace(PAREN, '').replace(/[ \t]+$/gm, '')
}

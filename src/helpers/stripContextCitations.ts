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

// Enumerating exact citation shapes lost twice: banning "[1, BAZA WIEDZY]" moved
// the marker to "(BAZA WIEDZY)", and banning that produced
// "(BAZA WIEDZY — 01_fizjologia_komorki.md)". So match what actually identifies
// a citation — an origin label — anywhere inside one bracket, whatever it is
// wrapped in. The labels are fixed uppercase strings that do not occur in
// ordinary Polish prose, so "(1) przygotuj zestaw" and "(np. GLUT)" stay put.
const LABELLED = new RegExp(`\\s*[[(][^\\][()]*${ORIGIN}[^\\][()]*[\\])]`, 'gu')

// The patterns eat the space in front of the bracket, so "płynna [4] ," and
// "pierwszy [1] drugi" close up on their own. Collapsing whitespace afterwards
// would only damage the indentation of Gemini's markdown bullets.
export function stripContextCitations(answer: string): string {
  return answer.replace(LABELLED, '').replace(SQUARE, '').replace(/[ \t]+$/gm, '')
}

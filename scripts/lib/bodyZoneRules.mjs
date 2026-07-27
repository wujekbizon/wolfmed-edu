/**
 * Keyword rules mapping an intervention's Polish text to a BodyZone.
 *
 * Weights encode specificity: a named anatomical structure outranks a
 * procedure that merely implies a region, which outranks a generic care word.
 * Patterns are stem-based because the source text is inflected.
 *
 * Stems carry a leading \b wherever they could otherwise match inside a longer
 * word — "ranie" sits inside "Pobieranie", which tagged every blood draw as a
 * wound until the boundary was added.
 */

/**
 * Procedures that name their own site. These decide the zone outright, because
 * scoring alone lets an incidental tissue word outrank the actual procedure:
 * a blood draw happens through skin, but it belongs to the arm.
 */
export const ZONE_OVERRIDES = [
  {
    zone: 'konczyny-gorne',
    pattern:
      /pobra\w* krwi|pobiera\w* krwi|wkłuci|kaniulac|wenflon|dostęp\w* (żyln|obwodow)|wlew\w* dożyln|gazometr|ciśnieni\w* tętnicz|mankiet/i,
  },
  {
    zone: 'usta-drogi-oddechowe',
    pattern:
      /odsysani|intubac|tracheostom|toalet\w* jamy ustnej|tlenoterapi|inhalac|nebuliza|rurk\w* (intubacyjn|tracheo)/i,
  },
  { zone: 'miednica', pattern: /cewnikowani|cewnik\w* (moczow|Foley)|pęcherz\w* moczow/i },
  { zone: 'brzuch', pattern: /sond[aęy] (żołądkow|dożołądkow)|gastrostom|\bPEG\b|perystaltyk/i },
  { zone: 'plecy', pattern: /odleżyn|kości? krzyżow|materac\w* przeciwodleżynow/i },
  { zone: 'klatka-piersiowa', pattern: /osłuchiwani\w* płuc|\bEKG\b|\bRKO\b|rentgen\w* klatki/i },
  { zone: 'oczy', pattern: /spojówk|źrenic/i },
  { zone: 'uszy', pattern: /małżowin|przewód słuchow/i },
]

export const ZONE_RULES = [
  {
    zone: 'oczy',
    patterns: [
      [/spojówk|źrenic|gałk[aię]\w* oczn|worek spojówkowy/i, 5],
      [/\bocz(u|y|ach|om)\b|krople do oczu|okulist/i, 4],
    ],
  },
  {
    zone: 'uszy',
    patterns: [
      [/małżowin|przewód słuchow|błon[ay] bębenkow/i, 5],
      [/\busz(u|y|ach|om)\b|\buch[ao]\b|aparat[ue]? słuchow|niedosłuch/i, 4],
    ],
  },
  {
    zone: 'usta-drogi-oddechowe',
    patterns: [
      [/jam[ayęi] ustn|toalet[ay] jamy ustnej|rurk[aięi] (intubacyjn|tracheo)|intubac|tracheostom/i, 6],
      [/odsysani|aspirac[jy]|drzew[ao] oskrzelow|drog(i|ach|ami) oddechow/i, 5],
      [/tlenoterapi|inhalac|nebuliza|maseczk\w* tlenow|wąs\w* tlenow|udrożni/i, 4],
      [/kaszl|odkrztusz|wydzielin\w* oskrzelow|połykani|dysfagi/i, 3],
    ],
  },
  {
    zone: 'glowa',
    patterns: [
      [/potylic|czaszk|owłosion\w* skór\w* głowy/i, 5],
      [/\bgłow(a|y|ę|ie|ą)\b|twarz|czoł[oa]/i, 3],
    ],
  },
  {
    zone: 'klatka-piersiowa',
    patterns: [
      [/klatk[aięi] piersiow|mostk|osłuchiw\w* płuc|RKO|uciśnięci\w* klatki/i, 6],
      [/\bEKG\b|akcj[aięi] serca|rytm[ue]? serca|osłuchiw/i, 4],
      [/fizjoterapi\w* oddechow|ćwicze\w* oddechow|oddech(u|ów|y|em)\b|duszno|SpO2|saturacj/i, 3],
    ],
  },
  {
    zone: 'brzuch',
    patterns: [
      [/brzuch|perystaltyk|jelit|żołądk|sond[aęy] (żołądkow|dożołądkow)|PEG\b|gastrostom/i, 6],
      [/wzdęci|zapar(ci|ć)|biegunk|stolc|defekacj|wypróżni/i, 4],
      [/karmieni\w* (przez|dojelit)|żywieni\w* dojelit/i, 3],
    ],
  },
  {
    zone: 'miednica',
    patterns: [
      [/cewnik|krocz|pęcherz\w* moczow|cewnikowani/i, 6],
      [/nietrzymani\w* moczu|pielucho|diurez|mocz(u|em|ie)\b/i, 4],
      [/higien[aęy] intymn|okolic\w* intymn/i, 4],
    ],
  },
  {
    zone: 'konczyny-gorne',
    patterns: [
      [/przedrami|nadgarstk|dłon|palc\w* rąk|\bramie|\bramien/i, 6],
      [/wkłuci|kaniul|wenflon|dostęp\w* (żyln|obwodow)|pobra\w* krwi|pobiera\w* krwi|wlew dożyln/i, 5],
      [/kończyn\w* górn/i, 5],
      [/ciśnieni\w* tętnicz|mankiet|\bRR\b|tętn(o|a|ie)\b/i, 3],
    ],
  },
  {
    zone: 'konczyny-dolne',
    patterns: [
      [/podudz|łydk|\bstop(a|y|ę|ie|ach)\b|pięt(a|y|ę|ach)|\bud(o|a|zie|ach)\b/i, 6],
      [/kończyn\w* doln/i, 5],
      [/przeciwzakrzepow|pończoch|zakrzepic|żylak|uniesieni\w* kończyn/i, 4],
    ],
  },
  {
    zone: 'plecy',
    patterns: [
      [/odleżyn|kości? krzyżow|okolic\w* krzyżow|łopatk|krętarz/i, 6],
      [/\bplec(y|ach|ów)\b|kręgosłup|lędźwiow/i, 5],
      [/zmian[ay] pozycji|zmian\w* ułożeni|materac przeciwodleżynow|odciąż/i, 4],
    ],
  },
  {
    zone: 'skora',
    patterns: [
      [/opatrun|\bran(a|y|ę|ie)\b|otarci|zaczerwienieni|maceracj/i, 5],
      [/skór(a|y|ę|ze|ą)|natłuszcz|nawilża\w* skór|balsam|\bkrem|maś[cć]/i, 4],
      [/kąpiel|\bmyci[ea]\b|higien[aęy] (ciała|osobist)|toalet[aęy] ciała/i, 3],
    ],
  },
  {
    zone: 'cale-cialo',
    patterns: [
      [/cał(ego|e|ym) ciał|ogóln\w* stan|temperatur\w* ciała|gorączk|dreszcz/i, 4],
      [/parametr\w* życiow|monitorowani\w* parametr/i, 3],
    ],
  },
]

/** A sentence touching this many regions is a survey, not a single site. */
const SURVEY_ZONE_COUNT = 4

/** Returns { zone, score, confidence, alternatives } or null when nothing matches. */
export function suggestBodyZone(text) {
  const scores = []

  for (const { zone, patterns } of ZONE_RULES) {
    let score = 0
    for (const [pattern, weight] of patterns) {
      if (pattern.test(text)) score += weight
    }
    if (score > 0) scores.push({ zone, score })
  }

  // Head-to-toe assessments ("oglądanie powłok ciała… otarć, blizn, małżowin")
  // name many regions; without this the first specific term wins the whole
  // intervention. Flagged low so a reviewer confirms the call.
  if (scores.length >= SURVEY_ZONE_COUNT) {
    return {
      zone: 'cale-cialo',
      score: scores.length,
      confidence: 'low',
      alternatives: scores
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((s) => `${s.zone}:${s.score}`),
    }
  }

  const overridden = ZONE_OVERRIDES.filter(({ pattern }) => pattern.test(text))
  if (overridden.length === 1) {
    return {
      zone: overridden[0].zone,
      score: 10,
      confidence: 'high',
      alternatives: [],
    }
  }

  // Two site-naming procedures in one sentence: let scoring break the tie, but
  // only between the zones those overrides nominated.
  if (overridden.length > 1) {
    const nominated = new Set(overridden.map(({ zone }) => zone))
    const contested = scores.filter(({ zone }) => nominated.has(zone))
    if (contested.length > 0) scores.length = 0, scores.push(...contested)
  }

  if (scores.length === 0) return null
  scores.sort((a, b) => b.score - a.score)

  const [best, second] = scores
  const margin = best.score - (second?.score ?? 0)
  const confidence = best.score >= 5 && margin >= 3 ? 'high' : margin >= 2 ? 'medium' : 'low'

  return {
    zone: best.zone,
    score: best.score,
    confidence,
    alternatives: scores.slice(1, 4).map((s) => `${s.zone}:${s.score}`),
  }
}

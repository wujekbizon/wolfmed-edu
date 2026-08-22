type ToolsIntro = {
  eyebrow: string
  // Two lines, broken where the design breaks them rather than wherever the
  // column happens to run out.
  headline: [string, string]
  lead: string
}

// The headline counts the tools, so it cannot be shared: opiekun-medyczny has
// six features and pielegniarstwo five.
export const PATH_TOOLS_INTRO: Record<string, ToolsIntro> = {
  'opiekun-medyczny': {
    eyebrow: 'Co dostajesz w środku',
    headline: ['Sześć narzędzi,', 'jeden kierunek nauki'],
    lead: 'Praktyczne moduły i materiały, które realnie pomogą Ci w nauce i przygotowaniu do egzaminu.',
  },
  pielegniarstwo: {
    eyebrow: 'Co dostajesz w środku',
    headline: ['Pięć narzędzi,', 'cały tok studiów'],
    lead: 'Praktyczne moduły i materiały, które realnie pomogą Ci w nauce przez wszystkie trzy lata.',
  },
}
